import { Request, Response } from "express";
import { PDFParse } from "pdf-parse";
import { prisma } from "../lib/prisma";

export const uploadResumeController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a PDF resume",
      });
    }

    if (
  req.file.mimetype !== "application/pdf" &&
  !req.file.originalname.toLowerCase().endsWith(".pdf")
) {
  return res.status(400).json({
    message: "Only PDF files are supported",
  });
}
    const parser = new PDFParse({
      data: req.file.buffer,
    });

    const pdfData = await parser.getText();

    await parser.destroy();

    const resumeText = pdfData.text.trim();

    if (!resumeText) {
      return res.status(400).json({
        message: "Could not extract text from the PDF",
      });
    }

    const resume = await prisma.resume.create({
  data: {
    fileName: req.file.originalname,
    resumeText,
    userId: req.user.userId,
  },
});

res.status(200).json({
  message: "Resume uploaded successfully",
  resumeId: resume.id,
  fileName: resume.fileName,
  text: resume.resumeText,
  pages: pdfData.total,
});
  } catch (error) {
    console.error("Resume upload error:", error);

    res.status(500).json({
      message: "Failed to process resume",
    });
  }
};