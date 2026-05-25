import { Request, Response } from "express";
import { CustomerModel } from "../models/customerModel";
import { asyncHandler } from "../middleware/asyncHandler";

// CREATE
export const createCustomer = asyncHandler(async (req: Request, res: Response) => {

    const customerData = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address
    };
    const customer = await CustomerModel.create(customerData);
    res.status(201).json({ success: true, data: customer });
});

// GET ALL CUSTOMERS with Pagination
export const getAllCustomers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  // එකවර දත්ත සහ මුළු ගණන ලබා ගැනීම
  const [customers, totalCount] = await Promise.all([
    CustomerModel.find().skip(skip).limit(limit),
    CustomerModel.countDocuments()
  ]);

  res.status(200).json({
    success: true,
    data: customers,
    pagination: {
      totalData: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit: limit
    }
  });
});

// DELETE
export const deleteCustomer = asyncHandler(async (req: Request, res: Response) => {
    await CustomerModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Customer deleted" });
});

// UPDATE
export const updateCustomer = asyncHandler(async (req: Request, res: Response) => {
    const customer = await CustomerModel.findByIdAndUpdate(req.params.id, req.body, {
        returnDocument: 'after', // Use this instead
        runValidators: true,
    });
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.status(200).json({ success: true, data: customer });
});

// SEARCH (name හෝ email හෝ phone හරහා සෙවීම)
export const searchCustomers = asyncHandler(async (req: Request, res: Response) => {
  const { query, page = 1, limit = 10 } = req.query; // උදාහරණ: /api/v1/customer/search?query=Kala
  const skip = (Number(page) - 1) * Number(limit);

  const filter = {
    $or: [
      { name: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } },
      { phone: { $regex: query, $options: "i" } },
    ],
  };

  const [customers, totalCount] = await Promise.all([
    (CustomerModel as any).find(filter).skip(skip).limit(Number(limit)),
    (CustomerModel as any).countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    data: customers,
    pagination: {
      totalData: totalCount,
      totalPages: Math.ceil(totalCount / Number(limit)),
      currentPage: Number(page),
      limit: Number(limit)
    }
  });
});

// GET SINGLE CUSTOMER BY ID
export const getCustomerById = asyncHandler(async (req: Request, res: Response) => {
  const customer = await CustomerModel.findById(req.params.id);
  
  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }
  
  res.status(200).json({ success: true, data: customer });
});