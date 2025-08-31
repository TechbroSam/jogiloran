// sanity/schemaTypes/review.ts
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'review',
  title: 'Review',
  type: 'document',
  fields: [
    defineField({
      name: 'authorName',
      title: 'Author Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      description: 'A rating from 1 to 5.',
      validation: (Rule) => Rule.required().min(1).max(5),
    }),
    defineField({
      name: 'reviewText',
      title: 'Review Text',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'product',
      title: 'Product',
      type: 'reference',
      to: [{type: 'product'}],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      author: 'authorName',
      rating: 'rating',
      product: 'product.name',
    },
    prepare({author, rating, product}) {
      return {
        title: `${author} on ${product}`,
        subtitle: `Rating: ${rating} ★`,
      }
    },
  },
})