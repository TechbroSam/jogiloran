// sanity/sanity.config.ts

import {structureTool, type StructureBuilder} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import { PluginOptions, DocumentDefinition, PreviewConfig } from 'sanity'

// Custom desk structure for singletons
const myStructure = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site Settings')
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (listItem) => !['siteSettings'].includes(listItem.getId()!),
      ),
    ])

export default defineConfig({
  name: 'default',
  title: 'Artisan Leather',
  projectId: '0rbd2qvr',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: myStructure,
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
function defineConfig(arg0: { name: string; title: string; projectId: string; dataset: string; plugins: PluginOptions[]; schema: { types: (({ type: "document"; name: "product" } & Omit<DocumentDefinition, "preview"> & { preview?: PreviewConfig<Record<string, string>, Record<never, any>> | undefined }) | ({ type: "document"; name: "category" } & Omit<DocumentDefinition, "preview"> & { preview?: PreviewConfig<Record<string, string>, Record<never, any>> | undefined }) | ({ type: "document"; name: "siteSettings" } & Omit<DocumentDefinition, "preview"> & { preview?: PreviewConfig<Record<string, string>, Record<never, any>> | undefined }) | ({ type: "document"; name: "review" } & Omit<DocumentDefinition, "preview"> & { preview?: PreviewConfig<{ author: string; rating: string; product: string }, Record<"product" | "rating" | "author", any>> | undefined }))[] } }) {
  throw new Error('Function not implemented.')
}

