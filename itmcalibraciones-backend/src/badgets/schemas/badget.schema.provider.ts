import { getConnectionToken } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { BadgetSchema } from "./badgets.schema";

export const badgetSchemaProvier = 
    {
        name: 'Badget',
        useFactory: (connection: Connection) => {
            const schema = BadgetSchema;
            const AutoIncrement = require('mongoose-sequence')(connection);
            schema.plugin(AutoIncrement, {inc_field: 'number', start_seq: 3000, default: 10000});
            return schema
        },
        inject: [getConnectionToken()],
      }

