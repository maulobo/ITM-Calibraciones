import { Model, Types } from "mongoose";
import { MatchDTO } from "../dto/query.dto";
import { convertToObjectId } from "./common-functions";

export interface QueryOptions<T> {
  find?: Record<string, any>;
  select?: string[];
  populate?: string[];
  limit?: number;
  offset?: number;
  orWhere?: { field: keyof T; values: any[] }[];
}

export class QueryBuilder<T> {
  private query: any;

  constructor(
    private readonly model: Model<T>,
    private readonly options: QueryOptions<T> = {},
  ) {
    this.query = this.model.find();
  }

  public find(fields: Partial<T>): QueryBuilder<T> {
    const findableFields = fields as { find?: Record<string, string> };

    if (findableFields.find) {
      const findObject = findableFields.find;
      for (const key in findObject) {
        const value = findObject[key];
        findableFields[key] = value;
      }
      delete findableFields.find;
    }

    for (const key in fields) {
      if (
        key !== "limit" &&
        key !== "offset" &&
        key !== "populate" &&
        key !== "select" &&
        key !== "sort"
      ) {
        fields[key] = convertToObjectId(fields[key]);
        this.query = this.query.find({ [key]: fields[key] });
      }
    }

    return this;
  }

  public match(matchQuery: MatchDTO): QueryBuilder<T> {
    const { field, searchText } = matchQuery;
    if (field && searchText) {
      const queryObject = {};
      queryObject[field as string] = { $regex: searchText, $options: "i" };
      this.query = this.query.find(queryObject);
    }
    return this;
  }

  public select(fields?: string[]): QueryBuilder<T> {
    const selectFields = fields || this.options.select;
    if (selectFields) {
      this.query = this.query.select(selectFields.join(" "));
    }

    return this;
  }

  public populate(fields?: string[]): QueryBuilder<T> {
    const populateFields = fields || this.options.populate;
    if (populateFields) {
      populateFields.forEach((field) => {
        const nestedFields = field.split(".");
        let populateObject = null;

        // Construir el objeto de populación anidada con varios niveles
        for (let i = nestedFields.length - 1; i >= 0; i--) {
          const nestedField = nestedFields[i];
          const currentPopulateObject = {
            path: nestedField,
            populate: populateObject,
          };
          populateObject = currentPopulateObject;
        }

        // Realizar la populación utilizando el objeto de populación anidada
        this.query = this.query.populate(populateObject);
      });
    }
    return this;
  }

  public where(field: keyof T, operator: string, value: any): QueryBuilder<T> {
    if (Array.isArray(value)) {
      const fieldExpression = { [String(field)]: { [`$${operator}`]: value } };
      this.query = this.query.find(fieldExpression);
    } else {
      const fieldExpression = `${String(field)} ${operator} ${value}`;
      this.query = this.query.where(fieldExpression);
    }
    return this;
  }

  public orWhere(field: keyof T, values: any[]): QueryBuilder<T> {
    const orConditions = values.map((value) => ({ [String(field)]: value }));
    this.query = this.query.or(orConditions);
    return this;
  }

  public gt(field: keyof T, value: any): QueryBuilder<T> {
    return this.where(field, ">", value);
  }

  public lt(field: keyof T, value: any): QueryBuilder<T> {
    return this.where(field, "<", value);
  }

  public gte(field: keyof T, value: any): QueryBuilder<T> {
    return this.where(field, ">=", value);
  }

  public lte(field: keyof T, value: any): QueryBuilder<T> {
    return this.where(field, "<=", value);
  }

  public limit(limit: number): QueryBuilder<T> {
    this.query = this.query.limit(limit);
    return this;
  }

  public offset(offset: number): QueryBuilder<T> {
    this.query = this.query.skip(offset);
    return this;
  }

  public async exec(): Promise<T[]> {
    return this.query.exec() as unknown as (T & { _id: Types.ObjectId })[];
  }
}
