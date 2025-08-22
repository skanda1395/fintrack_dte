import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from '@mui/material';
import { Transaction } from '@/interfaces/interfaces';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  transaction: Transaction | null;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  transaction,
}) => {
  const titleId = 'delete-dialog-title';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby={titleId}
      role="alertdialog"
    >
      <DialogTitle id={titleId}>Confirm Deletion</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body1">
          Are you sure you want to delete the transaction &quot;
          {transaction?.description}&quot;? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" aria-label="Cancel deletion">
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error" aria-label="Confirm and delete transaction">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
