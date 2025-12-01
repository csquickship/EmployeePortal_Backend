import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'employees' })
export class Employee extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  email: string;

  @Prop()
  age: number;

  @Prop({ required: true })
  userId: string;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
