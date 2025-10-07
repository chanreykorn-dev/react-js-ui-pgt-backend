import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  FormControl,
  OutlinedInput,
  Button,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { ActiveLastBreadcrumb } from "../../components/Breadcrumbs";
import JoditEditor from "jodit-react";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import { Bounce } from "react-toastify";
import Header from "../../components/Header";

const EditSpecification = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const editor = useRef(null);
  const [title, setTitle] = useState("");
  const [descriptions, setDescriptions] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [status, setStatus] = useState(1);
  const [loading, setLoading] = useState(false);

  // fetch one specification
  useEffect(() => {
    const fetchSpecification = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("User not logged in");

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/spicifications/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch specification");

        const data = await res.json();

        setTitle(data.title || "");
        setDescriptions(data.descriptions || "");
        setCategory(data.category || "");
        setSubCategory(data.category_sub || "");
        setStatus(data.status ?? 1);

      } catch (err) {
        console.error(err);
        toast.error("Error loading specification");
      }
    }

    fetchSpecification();
  }, [id]);

  // submit update
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not logged in");

      const decoded = jwtDecode(token);
      const user_id = decoded.user_id;

      const payload = {
        title,
        descriptions,
        category,
        category_sub: subCategory,
        status,
        user_id,
      };

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/spicifications/update/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to update specification");
      }

      toast.success("Specification updated successfully!");
      setTimeout(() => navigate("/specification"), 3000);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error updating specification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        transition={Bounce}
      />
      <ActiveLastBreadcrumb
        label={"Choose Us"}
        endpoint={"Edit Choose Us"}
      />

      <Header name={"Edit Choose Us"} description={"Edit the details of the Choose Us item."} />

      <form onSubmit={handleSubmit}>
        <Box sx={{ my: 2 }}>
          <FormControl sx={{ width: "100%" }}>
            <OutlinedInput
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormControl>
        </Box>

        <Box sx={{ my: 2 }}>
          <JoditEditor
            ref={editor}
            value={descriptions}
            config={{ height: 400 }}
            onBlur={(newContent) => setDescriptions(newContent)}
            placeholder="Descriptions"
          />
        </Box>

        <Box sx={{ my: 2 }}>
          <JoditEditor
            ref={editor}
            value={category}
            config={{ height: 400 }}
            onBlur={(newContent) => setCategory(newContent)}
            placeholder="Category"
          />
        </Box>

        <Box sx={{ my: 2 }}>
          <JoditEditor
            ref={editor}
            value={subCategory}
            config={{ height: 400 }}
            onBlur={(newContent) => setSubCategory(newContent)}
            placeholder="Sub Category"
          />
        </Box>

        <Box sx={{ my: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              onChange={(e) => setStatus(Number(e.target.value))}
              label="Status"
            >
              <MenuItem value={1}>Active</MenuItem>
              <MenuItem value={0}>Inactive</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Specification"}
        </Button>

      </form>
    </Box>
  );
};

export default EditSpecification;
