// sanity/schemaTypes/product.ts
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Product Name',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
    }),
    defineField({
      name: 'images',
      title: 'Product Images',
      type: 'array',
      of: [{type: 'image'}],
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'category',
      title: 'Product Category',
      type: 'reference',
      to: [{type: 'category'}],
      validation: (Rule) => Rule.required(),
    }),
    // This field is for products WITHOUT sizes (bags, belts, etc.)
    defineField({
      name: 'stock',
      title: 'Stock',
      type: 'number',
      description: 'Number of items available. Use this for products without different sizes.',
      hidden: (context: any) => {
        const document = context.document;
        // HIDE this field if the category is "Shoes"
        return document?.category?._ref === 'a2eda0ee-c33e-40cd-9656-6fa3f56fee75'; // Replace with YOUR Shoes ID
      }
    }),
   // This field is ONLY for products WITH sizes (shoes)
    defineField({
      name: 'sizes',
      title: 'Sizes & Stock',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'size', type: 'string', title: 'Size (e.g., UK 8)' },
            { name: 'stock', type: 'number', title: 'Stock for this size' },
          ],
        },
      ],
      description: 'Add available sizes and stock for each. Only appears if category is Shoes.',
      hidden: (context: any) => {
        const document = context.document;
        // SHOW this field ONLY if the category is "Shoes"
        return document?.category?._ref !== 'a2eda0ee-c33e-40cd-9656-6fa3f56fee75'; // Replace with YOUR Shoes ID
      }
    }),
    defineField({
      name: 'isBestSeller',
      title: 'Best Seller',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})