import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee } from './employee.schema';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectModel(Employee.name)
    private readonly employeeModel: Model<Employee>,
  ) {}

  async create(data: any) {
    return this.employeeModel.create(data);
  }

  // async findAll(id: string) {
  //   return this.employeeModel.find({ userId: id });
  // }

  async findAll(userId: string) {
    const isLocal = process.env.IS_LOCAL === 'true';

    if (isLocal) {
      return [
        {
          _id: 'emp_001',
          name: 'Amit Sharma',
          email: 'amit.sharma@example.com',
          age: 28,
          userId,
          __v: 0,
        },
        {
          _id: 'emp_002',
          name: 'Neha Verma',
          email: 'neha.verma@example.com',
          age: 32,
          userId,
          __v: 0,
        },
        {
          _id: 'emp_003',
          name: 'Rohan Gupta',
          email: 'rohan.gupta@example.com',
          age: 29,
          userId,
          __v: 0,
        },
        {
          _id: 'emp_004',
          name: 'Priya Nair',
          email: 'priya.nair@example.com',
          age: 26,
          userId,
          __v: 0,
        },
      ];
    }

    return this.employeeModel.find({ userId });
  }

  async Delete(id: string, userId: string) {
    if (!id) {
      throw new Error('ID is required');
    }

    const employee = await this.employeeModel.findOne({
      _id: id,
      userId: userId,
    });
    if (!employee) {
      return { message: 'Employee not found' };
    }

    // Delete the employee
    await this.employeeModel.findByIdAndDelete(id);

    return {
      message: 'Employee deleted successfully',
      id: id,
    };
  }

  async FindById(id: string) {
    if (!id) {
      throw new Error('ID is required');
    }

    const employee = await this.employeeModel.findById(id);

    if (!employee) {
      return { message: 'Employee not found' };
    }

    return employee;
  }
  async Edit(data: any) {
    if (!data?._id) return null;

    const updatedEmployee = await this.employeeModel.findByIdAndUpdate(
      data._id,
      data,
      { new: true },
    );

    return updatedEmployee;
  }
}
