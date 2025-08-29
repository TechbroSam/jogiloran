// sanity/schemaTypes/siteSettings.ts
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Banner Title',
      description: 'Optional: A bold title for the banner (e.g., "Summer Sale!").',
      type: 'string',
    }),
    defineField({
      name: 'bannerMessage',
      title: 'Banner Message',
      description: 'The main text for the banner. You can use bold/italic here.',
      type: 'array', // Changed to array for rich text
      of: [{type: 'block'}],
    }),
    defineField({
      name: 'bannerImage',
      title: 'Banner Image',
      description: 'Optional: An image for the banner, ideal for ads.',
      type: 'image',
    }),
    defineField({
      name: 'bannerUrl',
      title: 'Banner Link URL',
      description: 'Optional: Make the entire banner a clickable link.',
      type: 'url',
      validation: (Rule) => Rule.uri({
        scheme: ['http', 'https', 'mailto', 'tel'],
        allowRelative: true,
      }),
    }),
    defineField({
      name: 'isBannerActive',
      title: 'Is Banner Active?',
      type: 'boolean',
      initialValue: false,
    }),
    // Add this field for the discount
    defineField({
      name: 'discountPercentage',
      title: 'Sitewide Discount Percentage',
      description: 'Enter a number (e.g., 10 for 10%) to apply a sitewide discount. Leave empty or set to 0 for no discount.',
      type: 'number',
      validation: (Rule) => Rule.min(0).max(100),
    }),
  ],
})