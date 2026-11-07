import mongoose from "mongoose";
import { generateDiscountRiskReport } from "../services/riskReport.service.js";
import { DiscountRiskReport } from "../models/DiscountRiskReport.model.js";

const validateStoreFilter = (storeId, res) => {
  if (storeId && !mongoose.isValidObjectId(storeId)) {
    res.status(400).json({ success: false, message: "Invalid store ID" });
    return false;
  }
  return true;
};

export const generateRiskReport = async (req, res) => {
  const storeId = req.body?.storeId;
  if (!validateStoreFilter(storeId, res)) return;
  const report = await generateDiscountRiskReport(storeId || null);
  return res.status(201).json({
    success: true,
    message: "Discount risk report generated successfully.",
    data: report,
  });
};

export const getLatestReport = async (req, res) => {
  const { storeId } = req.query;
  if (!validateStoreFilter(storeId, res)) return;
  const query = storeId ? { storeId } : {};
  const latestReport = await DiscountRiskReport.findOne(query).sort({ createdAt: -1 });
  if (!latestReport) {
    return res.status(404).json({
      success: false,
      message: "No discount risk reports found.",
    });
  }
  return res.status(200).json({ success: true, data: latestReport });
};

export const getAllDiscountRiskReports = async (req, res) => {
  const { storeId, page: pageParam, limit: limitParam } = req.query;
  if (!validateStoreFilter(storeId, res)) return;
  const page = Math.max(1, Number.parseInt(pageParam, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(limitParam, 10) || 10));
  const query = storeId ? { storeId } : {};
  const [reports, totalReports] = await Promise.all([
    DiscountRiskReport.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    DiscountRiskReport.countDocuments(query),
  ]);
  return res.status(200).json({
    success: true,
    pagination: {
      totalReports,
      currentPage: page,
      totalPages: Math.ceil(totalReports / limit),
    },
    data: reports,
  });
};
