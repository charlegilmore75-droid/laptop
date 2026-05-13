import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { productSchema } from '@/lib/validations';
import { slugify } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;
    const q = searchParams.get('q');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort') || 'newest';
    const brand = searchParams.get('brand');
    const inStock = searchParams.get('inStock');

    const where: Record<string, unknown> = { isActive: true };
    if (q) {
      where.OR = [
        { nameAr: { contains: q, mode: 'insensitive' } },
        { nameEn: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (category) where.category = { slug: category };
    if (featured === 'true') where.isFeatured = true;
    if (brand) where.brand = { equals: brand, mode: 'insensitive' };
    if (inStock === 'true') where.stock = { gt: 0 };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as Record<string, number>).gte = parseFloat(minPrice);
      if (maxPrice) (where.price as Record<string, number>).lte = parseFloat(maxPrice);
    }

    const orderBy: Record<string, unknown> = {};
    switch (sort) {
      case 'price_asc': orderBy.price = 'asc'; break;
      case 'price_desc': orderBy.price = 'desc'; break;
      case 'featured': orderBy.isFeatured = 'desc'; break;
      default: orderBy.createdAt = 'desc';
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: true,
          _count: { select: { reviews: true } },
          reviews: { select: { rating: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products: products.map((p) => ({
        ...p,
        avgRating: p.reviews.length ? p.reviews.reduce((a, r) => a + r.rating, 0) / p.reviews.length : 0,
      })),
      total,
      totalPages: Math.ceil(total / limit),
      page,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = productSchema.parse(body);

    const slug = body.slug || slugify(`${data.nameEn}-${Date.now()}`);

    const product = await prisma.product.create({
      data: {
        ...data,
        slug,
        images: body.images || [],
        thumbnail: body.thumbnail || body.images?.[0] || null,
        specsAr: body.specsAr || null,
        specsEn: body.specsEn || null,
        tags: body.tags || [],
        sku: body.sku || null,
        brand: body.brand || null,
        model: body.model || null,
        weight: body.weight || null,
      },
    });

    return NextResponse.json({ product });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
