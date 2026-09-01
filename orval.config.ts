import { defineConfig } from 'orval';

export default defineConfig( {
  'on-off' : {
    input  : './src/assets/openapi/openapi.json',
    output : {
      target   : './src/api/generated',
      client   : 'react-query',
      clean    : true,
      mock     : false,
      mode     : 'tags-split',
      override : {
        mutator : {
          name : 'apiFetch',
          path : './src/api/http.ts',
        },
      },
    },
    hooks : {
      afterAllFilesWrite : 'prettier --write',
    },
  },
} );