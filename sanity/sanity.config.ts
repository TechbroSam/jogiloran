// sanity.config.ts
import { defineConfig } from 'sanity'
import { structureTool, type StructureBuilder } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes'

// Custom desk structure for singletons
const myStructure = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      // Our singleton 'Site Settings' document
      S.listItem()
        .title('Site Settings')
        .id('siteSettings')
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
        ),
      S.divider(),
      
      // The rest of our document types, but filtering out the singleton
      ...S.documentTypeListItems().filter(
        listItem => !['siteSettings'].includes(listItem.getId()!)
      ),
    ])

export default defineConfig({
  name: 'default',
  title: 'Axion Leather',
  projectId: '0rbd2qvr',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: myStructure,
    }), 
    visionTool()
  ],

  schema: {
    types: schemaTypes,
  },
})