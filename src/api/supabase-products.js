import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Supabase Config:', {
  url: supabaseUrl,
  hasKey: !!supabaseKey,
  keyLength: supabaseKey?.length
});

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!', { supabaseUrl, hasKey: !!supabaseKey });
}

const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };

export const productsService = {
  async getProducts(includeInactive = false) {
    return includeInactive ? this.getAllProductsIncludingInactive() : this.getAllProducts();
  },

  async getAllProducts() {
    try {
      console.log('🔍 Fetching products from Supabase...');

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images (
            id,
            url,
            position
          ),
          product_variants (
            id,
            gelato_variant_id,
            sku,
            size,
            color,
            color_hex,
            price,
            stock,
            is_available,
            image_url,
            design
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching products:', error);
        throw error;
      }

      console.log('✅ Products fetched:', data?.length);
      console.log('📦 Sample product:', data?.[0]);

      const transformed = data.map(transformProduct);
      console.log('📦 Sample transformed:', transformed?.[0]);

      return transformed;
    } catch (err) {
      console.error('❌ Error in getAllProducts:', err);
      throw err;
    }
  },

  async getAllProductsIncludingInactive() {
    try {
      console.log('🔍 Fetching ALL products (including inactive) from Supabase...');

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images (
            id,
            url,
            position
          ),
          product_variants (
            id,
            gelato_variant_id,
            sku,
            size,
            color,
            color_hex,
            price,
            stock,
            is_available,
            image_url,
            design
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching products:', error);
        throw error;
      }

      console.log('✅ Products fetched (including inactive):', data?.length);
      console.log('📦 Sample product:', data?.[0]);

      const transformed = data.map(transformProduct);
      console.log('📦 Sample transformed:', transformed?.[0]);

      return transformed;
    } catch (err) {
      console.error('❌ Error in getAllProductsIncludingInactive:', err);
      throw err;
    }
  },

  async getProductById(id) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images (
          id,
          url,
          position
        ),
        product_variants (
          id,
          gelato_variant_id,
          sku,
          size,
          color,
          color_hex,
          price,
          stock,
          is_available,
          image_url,
          design
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching product:', error);
      throw error;
    }

    console.log('📦 Product loaded:', data);
    return data ? transformProduct(data) : null;
  },

  async getProductsByCollection(collection) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images (
          id,
          url,
          position
        ),
        product_variants (
          id,
          gelato_variant_id,
          sku,
          size,
          color,
          color_hex,
          price,
          stock,
          is_available,
          image_url
        )
      `)
      .eq('collection', collection)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching collection products:', error);
      throw error;
    }

    return data.map(transformProduct);
  },

  async searchProducts(searchTerm) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images (
          id,
          url,
          position
        ),
        product_variants (
          id,
          gelato_variant_id,
          sku,
          size,
          color,
          color_hex,
          price,
          stock,
          is_available,
          image_url
        )
      `)
      .eq('is_active', true)
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching products:', error);
      throw error;
    }

    return data.map(transformProduct);
  },

  async createProduct(product) {
    const productData = {
      name: product.name,
      description: product.description,
      price: product.price,
      currency: product.currency || 'EUR',
      image: product.images?.[0] || '/placeholder-product.svg',
      category: product.category || 'apparel',
      collection: product.collection || 'first-contact',
      sku: product.sku,
      gelato_product_id: product.gelatoProductId,
      is_active: true
    };

    const { data: createdProduct, error: productError } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (productError) {
      console.error('Error creating product:', productError);
      throw productError;
    }

    if (product.images && product.images.length > 0) {
      const images = product.images.map((url, index) => ({
        product_id: createdProduct.id,
        url,
        position: index
      }));

      const { error: imagesError } = await supabase
        .from('product_images')
        .insert(images);

      if (imagesError) {
        console.error('Error creating images:', imagesError);
      }
    }

    if (product.variants && product.variants.length > 0) {
      const variants = product.variants.map(v => ({
        product_id: createdProduct.id,
        gelato_variant_id: v.gelatoVariantId,
        sku: v.sku || `${product.sku}-${v.size}-${v.color}`,
        size: v.size,
        color: v.color,
        color_hex: v.colorHex,
        price: v.price,
        stock: v.stock || 999,
        is_available: v.isAvailable !== undefined ? v.isAvailable : true,
        image_url: v.image || null
      }));

      const { error: variantsError } = await supabase
        .from('product_variants')
        .insert(variants);

      if (variantsError) {
        console.error('Error creating variants:', variantsError);
      }
    }

    return transformProduct({
      ...createdProduct,
      product_images: product.images?.map((url, index) => ({ url, position: index })) || [],
      product_variants: product.variants || []
    });
  },

  async upsertProduct(product) {
    const { product_images, product_variants, ...productData } = product;

    const { data, error } = await supabase
      .from('products')
      .upsert(productData)
      .select()
      .single();

    if (error) {
      console.error('Error upserting product:', error);
      throw error;
    }

    if (product_images && product_images.length > 0) {
      await supabase
        .from('product_images')
        .delete()
        .eq('product_id', data.id);

      const images = product_images.map((img, index) => ({
        product_id: data.id,
        url: img.url || img,
        position: img.position !== undefined ? img.position : index
      }));

      await supabase.from('product_images').insert(images);
    }

    if (product_variants && product_variants.length > 0) {
      await supabase
        .from('product_variants')
        .delete()
        .eq('product_id', data.id);

      const variants = product_variants.map(v => ({
        ...v,
        product_id: data.id
      }));

      await supabase.from('product_variants').insert(variants);
    }

    return data;
  },

  async updateProduct(id, updates) {
    try {
      const { images: imageUrls, variants: variantData, ...productData } = updates;

      // Update main product
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating product:', error);
        throw error;
      }

      // Update images if provided
      if (imageUrls && imageUrls.length > 0) {
        await supabase
          .from('product_images')
          .delete()
          .eq('product_id', id);

        const images = imageUrls.map((url, index) => ({
          product_id: id,
          url,
          position: index
        }));

        await supabase.from('product_images').insert(images);
      }

      // Update variants if provided
      if (variantData && variantData.length > 0) {
        await supabase
          .from('product_variants')
          .delete()
          .eq('product_id', id);

        const variants = variantData.map(v => ({
          product_id: id,
          gelato_variant_id: v.gelatoVariantId,
          sku: v.sku,
          size: v.size,
          color: v.color,
          color_hex: v.colorHex,
          price: v.price,
          stock: v.stock || 999,
          is_available: v.isAvailable !== undefined ? v.isAvailable : true,
          image_url: v.image || null,
          design: v.design || null
        }));

        await supabase.from('product_variants').insert(variants);
      }

      return data;
    } catch (err) {
      console.error('Error in updateProduct:', err);
      throw err;
    }
  },

  async deleteProduct(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
};

function transformProduct(dbProduct) {
  const images = (dbProduct.product_images || [])
    .sort((a, b) => a.position - b.position)
    .map(img => img.url);

  const variants = (dbProduct.product_variants || []).map(v => ({
    id: v.id,
    sku: v.sku,
    size: v.size,
    color: v.color,
    colorHex: v.color_hex,
    price: parseFloat(v.price),
    stock: v.stock,
    isAvailable: v.is_available,
    image: v.image_url,
    gelatoVariantId: v.gelato_variant_id,
    design: v.design
  }));

  const productImage = images.length > 0 ? images[0] : (dbProduct.image || '/placeholder-product.svg');
  const finalImages = images.length > 0 ? images : [productImage];

  return {
    id: dbProduct.id,
    slug: dbProduct.slug,
    name: dbProduct.name,
    description: dbProduct.description,
    price: parseFloat(dbProduct.price),
    currency: dbProduct.currency,
    image: productImage,
    images: finalImages,
    category: dbProduct.category,
    collection: dbProduct.collection,
    sku: dbProduct.sku,
    gelatoProductId: dbProduct.gelato_product_id,
    variants,
    isActive: dbProduct.is_active,
    createdAt: dbProduct.created_at,
    updatedAt: dbProduct.updated_at
  };
}

export default productsService;
