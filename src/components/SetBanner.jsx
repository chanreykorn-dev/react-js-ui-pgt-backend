import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import Button from "@mui/material/Button";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function SetBanner({ open, handleClose, rowId }) {
    const [category, setCategory] = React.useState(null);
    const [newProduct, setNewProduct] = React.useState(null);

    // ✅ Generic function with parameter
    const updateBanner = async (bannerType) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("User not logged in");

            const payload = { type: bannerType }; // now integer

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/banners/set-type/${rowId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) throw new Error("Failed to update banner");

            toast.success(`Banner updated to type ${bannerType} successfully!`);
            handleClose();
        } catch (err) {
            console.error(err);
            toast.error("Error updating banner");
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
            <DialogTitle>Update option of product</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">
                    Choose an option to update the product banner.
                </DialogContentText>

                {/* Example with IDs */}
                <Button variant="contained" fullWidth onClick={() => updateBanner(1)} sx={{ mt: 2 }}>
                    Set as Banner Home
                </Button>
                <Button variant="contained" fullWidth onClick={() => updateBanner(2)} sx={{ mt: 2 }}>
                    Set as Banner About Us
                </Button>
                <Button variant="contained" fullWidth onClick={() => updateBanner(3)} sx={{ mt: 2 }}>
                    Set as Banner Service
                </Button>
                <Button variant="contained" fullWidth onClick={() => updateBanner(4)} sx={{ mt: 2 }}>
                    Set as Banner Product
                </Button>
                <Button variant="contained" fullWidth onClick={() => updateBanner(5)} sx={{ mt: 2 }}>
                    Set as Banner Project
                </Button>
                <Button variant="contained" fullWidth onClick={() => updateBanner(6)} sx={{ mt: 2 }}>
                    Set as Banner News
                </Button>
                <Button variant="contained" fullWidth onClick={() => updateBanner(7)} sx={{ mt: 2 }}>
                    Set as Banner Contact
                </Button>

            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
