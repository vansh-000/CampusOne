import { Router } from 'express';
import { changeBranchStatus, createBranch, deleteBranch, getBranchByDepartment, getBranchById, getBranchesByInstitution, updateBranch } from '../controllers/branch.controller.js';

const router = Router();

// public routes
router.get('/:institutionId', getBranchesByInstitution);
router.get('/:branchId', getBranchById);
router.get('/:departmentId', getBranchByDepartment);

// private routes
router.post('/:institutionId', createBranch);
router.put('/:branchId', updateBranch);
router.delete('/:branchId', deleteBranch);
router.patch('/status/:branchId', changeBranchStatus);

export default router;