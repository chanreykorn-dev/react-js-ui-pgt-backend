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

export default function AlertDialogSlide({ open, handleClose, rowId }) {
    const [category, setCategory] = React.useState(null);
    const [newProduct, setNewProduct] = React.useState(null);

    const updateCategory = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("User not logged in");

            const decoded = jwtDecode(token);
            const user_id = decoded.user_id;

            // ✅ payload to update product_category = 1
            const payload = {
                product_category: 1,
                user_id,
            };

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/products/update/product/category/${rowId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) throw new Error("Failed to update product category");

            setCategory(1); // update local state
            toast.success("Product category updated successfully!");

            // ✅ Close modal after success
            handleClose();

        } catch (err) {
            console.error(err);
            toast.error("Error updating product category");
        }
    };

    const updateNew = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("User not logged in");

            const decoded = jwtDecode(token);
            const user_id = decoded.user_id;

            // ✅ payload to update product_category = 1
            const payload = {
                new: 1,
                user_id,
            };

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/products/update/product/new/${rowId}`,
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

            setNewProduct(1); // update local state
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
                <Button variant="contained" fullWidth onClick={updateCategory} sx={{ mt: 2 }}>
                    Set us to category
                </Button>
                <Button variant="contained" fullWidth onClick={updateNew} sx={{ mt: 2 }}>
                    Set us to new
                </Button>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
