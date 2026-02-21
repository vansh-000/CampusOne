import { Application } from "../models/application.model.js";
import { ApplicationFlowNode } from "../models/applicationFlowNode.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createApplication = asyncHandler(async (req, res) => {
    const { applicationType, subject, description, startDate, endDate, toUserId } = req.body;

    const applicantId = req.user._id;
    const institutionId = req.user.institutionId;

    const application = await Application.create({
        applicantId,
        institutionId,
        applicationType,
        subject,
        description,
        startDate,
        endDate
    });

    const firstNode = await ApplicationFlowNode.create({
        applicationId: application._id,
        fromUserId: applicantId,
        toUserId,
        actionType: "forwarded",
        message: "Application Submitted"
    });

    application.initialStepId = firstNode._id;
    application.currentStepId = firstNode._id;

    await application.save();

    res.status(201).json(
        new ApiResponse(201, application, "Application Created Successfully")
    );
});

const forwardApplication = asyncHandler(async (req, res) => {
    const { applicationId } = req.params;
    const { toUserId, message } = req.body;

    const application = await Application.findById(applicationId);
    if (!application) throw new ApiError(404, "Application not found");

    const currentNode = await ApplicationFlowNode.findById(application.currentStepId);

    const newNode = await ApplicationFlowNode.create({
        applicationId,
        fromUserId: req.user._id,
        toUserId,
        message,
        actionType: "forwarded",
        previousNodeId: currentNode._id
    });

    currentNode.nextNodeId = newNode._id;
    await currentNode.save();

    application.currentStepId = newNode._id;
    application.currentStatus = "forwarded";

    await application.save();

    res.json(new ApiResponse(200, newNode, "Application Forwarded"));
});

const approveApplication = asyncHandler(async (req, res) => {
    const { applicationId } = req.params;
    const { message } = req.body;

    const application = await Application.findById(applicationId);
    if (!application) throw new ApiError(404, "Application not found");

    const currentNode = await ApplicationFlowNode.findById(application.currentStepId);

    const approvalNode = await ApplicationFlowNode.create({
        applicationId,
        fromUserId: req.user._id,
        toUserId: req.user._id,
        message,
        actionType: "approved",
        previousNodeId: currentNode._id
    });

    currentNode.nextNodeId = approvalNode._id;
    await currentNode.save();

    application.currentStepId = approvalNode._id;
    application.currentStatus = "approved";

    await application.save();

    res.json(new ApiResponse("Application Approved", 200, approvalNode));
});

const rejectApplication = asyncHandler(async (req, res) => {
    const { applicationId } = req.params;
    const { message } = req.body;

    const application = await Application.findById(applicationId);
    if (!application) throw new ApiError(404, "Application not found");

    const currentNode = await ApplicationFlowNode.findById(application.currentStepId);

    const rejectNode = await ApplicationFlowNode.create({
        applicationId,
        fromUserId: req.user._id,
        toUserId: req.user._id,
        message,
        actionType: "rejected",
        previousNodeId: currentNode._id
    });

    currentNode.nextNodeId = rejectNode._id;
    await currentNode.save();

    application.currentStepId = rejectNode._id;
    application.currentStatus = "rejected";

    await application.save();

    res.json(new ApiResponse(200, rejectNode, "Application Rejected"));
});

const getApplicationById = asyncHandler(async (req, res) => {
    const application = await Application.findById(req.params.applicationId)
        .populate("applicantId", "name email");

    if (!application) throw new ApiError(404, "Application not found");

    const flowNodes = await ApplicationFlowNode.find({
        applicationId: application._id
    }).sort({ createdAt: 1 });

    res.json(new ApiResponse(200, { application, flowNodes }));
});

const getMyApplications = asyncHandler(async (req, res) => {
    const applications = await Application.find({
        applicantId: req.user._id
    }).sort({ createdAt: -1 });

    res.json(new ApiResponse(200, applications));
});

const getPendingApprovals = asyncHandler(async (req, res) => {
    const nodes = await ApplicationFlowNode.find({
        toUserId: req.user._id,
        actionType: "forwarded"
    });

    const ids = nodes.map(n => n.applicationId);

    const applications = await Application.find({
        _id: { $in: ids },
        currentStatus: { $in: ["pending", "forwarded"] }
    }).populate("applicantId", "name email");

    res.json(new ApiResponse(200, applications));
});

const getProcessedByMe = asyncHandler(async (req, res) => {
    const nodes = await ApplicationFlowNode.find({
        fromUserId: req.user._id
    });

    const ids = nodes.map(n => n.applicationId);

    const applications = await Application.find({
        _id: { $in: ids }
    });

    res.json(new ApiResponse(200, applications));
});

export {
    createApplication,
    forwardApplication,
    approveApplication,
    rejectApplication,
    getApplicationById,
    getMyApplications,
    getPendingApprovals,
    getProcessedByMe
}