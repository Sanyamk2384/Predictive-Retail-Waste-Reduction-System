import mongoose from "mongoose";
import { InventoryAnalysisReport } from "../models/inventoryAnalysisReport.js";
import { generateInventoryAnalysisReport } from "../services/inventoryAnalysisService.js";

export const createInventoryAnalysisReport = async (req, res) => {
  try {
    const storeId = req.body?.storeId;
    if (storeId && !mongoose.isValidObjectId(storeId)) {
      return res.status(400).json({ success: false, message: "Invalid store ID" });
    }
    const report = await generateInventoryAnalysisReport(storeId || null);

    return res.status(201).json({
      success: true,
      message: "Inventory analysis report generated successfully.",
      data: report,
    });
  } catch (error) {
    console.error("Error generating inventory analysis report:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error: Unable to analyze inventory.",
    });
  }
};

export const getLatestInventoryAnalysisReport = async (req, res) => {
  try {
    const { storeId } = req.query;
    if (storeId && !mongoose.isValidObjectId(storeId)) {
      return res.status(400).json({ success: false, message: "Invalid store ID" });
    }
    const query = storeId ? { storeId } : {};

    const latestReport = await InventoryAnalysisReport.findOne(query).sort({
      createdAt: -1,
    });

    if (!latestReport) {
      return res.status(404).json({
        success: false,
        message: "No inventory analysis reports found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: latestReport,
    });
  } catch (error) {
    console.error("Error fetching latest inventory report:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error: Unable to fetch inventory report.",
    });
  }
};
