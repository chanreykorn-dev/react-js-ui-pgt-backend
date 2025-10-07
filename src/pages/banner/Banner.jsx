import * as React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { ActionEdit } from "../../components/Helper/ActionEdit";
import ActionDelete from "../../components/Helper/ActionDelete";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { useNavigate, Link } from 'react-router-dom';
import { ActiveLastBreadcrumb } from "../../components/Breadcrumbs";
import { useAuth } from "../../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import Header from "../../components/Header";
import { Button, TableSortLabel, useMediaQuery, useTheme } from "@mui/material";
import SetBanner from "../../components/SetBanner";

const headCells = [
    { id: "action", label: "Action", minWidth: 150 },
    { id: "id", label: "ID", minWidth: 100 },
    { id: "image", label: "Image", minWidth: 170 },
    { id: "description", label: "Description", minWidth: 200 },
    { id: "status", label: "Status", minWidth: 100 },
];

function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
    return 0;
}

function getComparator(order, orderBy) {
    return order === "desc"
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

export default function Banner() {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [rows, setRows] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const navigate = useNavigate();
    const { hasPermission } = useAuth();
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

    const [open, setOpen] = React.useState(false);
    const [selectedId, setSelectedId] = React.useState(null);

    const handleOpen = (id) => {
        setSelectedId(id);
        setOpen(true);
    };

    const fetchBanner = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("User not logged in");
            const response = await fetch(`${import.meta.env.VITE_API_URL}/banners/`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) throw new Error("Failed to fetch banners");
            const data = await response.json();
            setRows(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching banners:", err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchBanner();
    }, []);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    return (
        <Box>
            <ToastContainer position="top-right" autoClose={3000} />
            <ActiveLastBreadcrumb label={'Banner'} endpoint={'List Banner'} />
            <Paper sx={{ width: "100%", overflow: "hidden" }}>
                <Box sx={{ padding: '5px 16px' }}>
                    <Header name={"Banner"} description={"Manage your banner here."} />
                </Box>
                <Box sx={{ padding: '5px 16px' }}>
                    {hasPermission("Create banners") ? (
                        <Link to="/banners/add" style={{ textDecoration: "none" }}>
                            <Button variant="contained">Create Banner</Button>
                        </Link>
                    ) : (
                        <Button variant="contained" disabled>
                            Create Banner
                        </Button>
                    )}
                </Box>
                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <React.Fragment>
                        <TableContainer sx={{ maxHeight: isSmall ? 400 : "auto" }}>
                            <Table size="small" stickyHeader={isSmall} sx={{ minWidth: 650 }}>
                                <TableHead>
                                    <TableRow>
                                        {headCells.map((headCell) => (
                                            <TableCell
                                                key={headCell.id}
                                                sx={{
                                                    minWidth: headCell.minWidth,
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                }}
                                            >
                                                {headCell.label}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rows.length > 0 ? (
                                        rows
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .map((row, idx) => (
                                                <TableRow hover key={row.id || idx}>
                                                    <TableCell>
                                                        <ActionEdit
                                                            onEdit={() => navigate(`/banners/edit/${row.id}`)}
                                                            message="Edit Banner"
                                                            disabled={!hasPermission("Update banners")}
                                                        />
                                                        <ActionDelete
                                                            link={`${import.meta.env.VITE_API_URL}/banners/delete/${row.id}`}
                                                            onDelete={fetchBanner}
                                                            message="Banner deleted successfully"
                                                            disabled={!hasPermission("Delete banners")}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button variant="contained" onClick={() => handleOpen(row.id)}>
                                                            Options
                                                        </Button>

                                                        {/* Always rendered (no conditional hooks issue) */}
                                                        <SetBanner
                                                            open={open}
                                                            handleClose={() => setOpen(false)}
                                                            rowId={selectedId}
                                                        />
                                                    </TableCell>
                                                    <TableCell>{row.id}</TableCell>
                                                    <TableCell>
                                                        {row.path ? (
                                                            <img
                                                                src={`${import.meta.env.VITE_API_URL}/uploads/${row.path}`}
                                                                alt={row.description || "Banner image"}
                                                                style={{ width: 80, height: 40, objectFit: "cover", borderRadius: 4 }}
                                                            />
                                                        ) : "No image"}
                                                    </TableCell>
                                                    {/* <TableCell>
                                                        {row.title ? row.title : ""}
                                                    </TableCell> */}
                                                    <TableCell>
                                                        {row.title
                                                            ? row.title
                                                                .replace(/<[^>]+>/g, "")
                                                                .slice(0, 200) +
                                                            (row.title.length > 200 ? "..." : "")
                                                            : ""}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span
                                                            style={{
                                                                padding: "2px 8px",
                                                                borderRadius: "12px",
                                                                fontSize: "12px",
                                                                fontWeight: "bold",
                                                                color: row.status === 1 ? "#0f5132" : "#842029",
                                                                backgroundColor:
                                                                    row.status === 1 ? "#d1e7dd" : "#f8d7da",
                                                            }}
                                                        >
                                                            {row.status === 1 ? "Active" : "Inactive"}
                                                        </span>
                                                    </TableCell>

                                                </TableRow>
                                            ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={headCells.length} align="center">
                                                No banners found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 100]}
                            component="div"
                            count={rows.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </React.Fragment>
                )}
            </Paper>
        </Box>
    );
}
