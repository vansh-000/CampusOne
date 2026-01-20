import { Router } from 'express';
import {
  changeBranchStatus,
  createBranch,
  deleteBranch,
  getBranchByDepartment,
  getBranchById,
  getBranchesByInstitution,
  updateBranch
} from '../controllers/branch.controller.js';

const router = Router();

// public routes
router.get('/institutions/:institutionId/branches', getBranchesByInstitution);
router.get('/branches/:branchId', getBranchById);
router.get('/departments/:departmentId/branches', getBranchByDepartment);


router.post('/institutions/:institutionId/branches', createBranch);
router.put('/branches/:branchId', updateBranch);
router.delete('/branches/:branchId', deleteBranch);
router.patch('/branches/:branchId/status', changeBranchStatus);

export default router;