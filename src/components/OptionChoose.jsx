import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import Button from "@mui/material/Button";
import { jwtDecode } from "jwt-decode"; // ✅ import
import { toast } from "react-toastify"; // ✅ import
import Stack from "@mui/material/Stack";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function OptionChoose({ open, handleClose, rowId }) {
    const [newProduct, setProcess] = React.useState(null);

    const updateProcess = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("User not logged in");

            const decoded = jwtDecode(token);
            const user_id = decoded.user_id;

            // ✅ payload to update product_category = 1
            const payload = {
                our_process: 1,
                user_id,
            };

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/choose-us/our/process/all/public/${rowId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) throw new Error("Failed to update product new");

            setProcess(1); // update local state
            toast.success("Product new updated successfully!");

            // ✅ Close modal after success
            handleClose();

        } catch (err) {
            console.error(err);
            toast.error("Error updating product new");
        }
    };

    return (
        <Dialog
            open={open}
            TransitionComponent={Transition}
            keepMounted
            onClose={handleClose}
            aria-describedby="alert-dialog-slide-description"
        >
            <DialogTitle>{`Update option of product category`}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">
                    Choose an option to update the product category and new product.
                </DialogContentText>
                <Button variant="contained" fullWidth onClick={updateProcess} sx={{ mt: 2 }}>
                    Set us to Process
                </Button>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
