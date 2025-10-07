import * as React from "react";
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    Button,
    useMediaQuery,
    useTheme,
    OutlinedInput,
    FormControl,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { Link, useNavigate } from "react-router-dom";
import { ActiveLastBreadcrumb } from "../../components/Breadcrumbs";
import { ActionEdit } from "../../components/Helper/ActionEdit";
import ActionDelete from "../../components/Helper/ActionDelete";
import Loading from "../../components/Loading";
import Header from "../../components/Header";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Bounce, toast, ToastContainer } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

const headCells = [
    { id: "action", label: "Action", width: 200 },
    { id: "id", label: "ID", width: 60 },
    { id: "username", label: "Username", width: 280 },
    { id: "email", label: "Email", width: 300 },
    { id: "role_id", label: "Role", width: 120 },
    { id: "status", label: "Status", width: 120 },
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

export default function User() {
    const [rows, setRows] = React.useState([]);
    const [filteredRows, setFilteredRows] = React.useState([]);
    const [order, setOrder] = React.useState("asc");
    const [orderBy, setOrderBy] = React.useState("username");
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [loading, setLoading] = React.useState(true);

    const [searchName, setSearchName] = React.useState("");
    const [startDate, setStartDate] = React.useState(null);
    const [endDate, setEndDate] = React.useState(null);

    const navigate = useNavigate();
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
    const { hasPermission } = useAuth();

    React.useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("User not logged in");

            const res = await fetch(`${import.meta.env.VITE_API_URL}/users/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch users");

            const data = await res.json();
            console.log("Fetched users:", data);
            setRows(data);
            setFilteredRows(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // ✅ Fixed search function
    const handleSearch = () => {
        let filtered = [...rows];

        if (searchName) {
            filtered = filtered.filter((row) =>
                row.username?.toLowerCase().includes(searchName.toLowerCase()) ||
                row.email?.toLowerCase().includes(searchName.toLowerCase())
            );
        }

        if (startDate) {
            filtered = filtered.filter((row) => {
                if (!row.created_at) return false;
                return new Date(row.created_at) >= startDate.toDate();
            });
        }

        if (endDate) {
            filtered = filtered.filter((row) => {
                if (!row.created_at) return false;
                return new Date(row.created_at) <= endDate.toDate();
            });
        }

        setFilteredRows(filtered);
        setPage(0);
    };

    const visibleRows = React.useMemo(
        () =>
            [...filteredRows]
                .sort(getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
        [filteredRows, order, orderBy, page, rowsPerPage]
    );

    if (loading)
        return (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <Loading />
            </Box>
        );

    return (
        <Box sx={{ width: "100%" }}>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
                transition={Bounce}
            />
            <ActiveLastBreadcrumb label={"User"} endpoint={"List User"} />
            <Paper sx={{ width: "100%", mb: 2 }}>

                <Box sx={{ padding: "5px 16px" }}>
                    <Header title="User" subtitle="List of Users" />
                </Box>

                <Box sx={{ padding: '5px 16px' }}>
                    {hasPermission("Create Users") ? (
                        <Link to="/users/add" style={{ textDecoration: "none" }}>
                            <Button variant="contained">Create Users</Button>
                        </Link>
                    ) : (
                        <Button variant="contained" disabled>
                            Create Users
                        </Button>
                    )}
                </Box>

                {/* Search UI */}
                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 2,
                        alignItems: "center",
                        padding: "10px 16px",
                    }}
                >
                    <FormControl sx={{ width: "35%" }}>
                        <OutlinedInput
                            placeholder="Search by Username or Email"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            sx={{ height: 40, fontSize: 14, paddingX: 1 }}
                        />
                    </FormControl>

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Start Date"
                            value={startDate}
                            onChange={(newValue) => setStartDate(newValue)}
                            slotProps={{ textField: { size: "small" } }}
                        />
                        <DatePicker
                            label="End Date"
                            value={endDate}
                            onChange={(newValue) => setEndDate(newValue)}
                            slotProps={{ textField: { size: "small" } }}
                        />
                    </LocalizationProvider>

                    <Button variant="contained" onClick={handleSearch}>
                        Search
                    </Button>
                </Box>

                <TableContainer sx={{ maxHeight: isSmall ? 400 : "auto" }}>
                    <Table size="small" stickyHeader={isSmall} sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow>
                                {headCells.map((headCell) => {
                                    if (isSmall && ["descriptions", "image"].includes(headCell.id))
                                        return null;
                                    return (
                                        <TableCell
                                            key={headCell.id}
                                            sx={{
                                                minWidth: headCell.width,
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            <TableSortLabel
                                                active={orderBy === headCell.id}
                                                direction={orderBy === headCell.id ? order : "asc"}
                                                onClick={(e) => handleRequestSort(e, headCell.id)}
                                            >
                                                {headCell.label}
                                                {orderBy === headCell.id ? (
                                                    <Box component="span" sx={visuallyHidden}>
                                                        {order === "desc"
                                                            ? "sorted descending"
                                                            : "sorted ascending"}
                                                    </Box>
                                                ) : null}
                                            </TableSortLabel>
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {visibleRows.map((row) => (
                                <TableRow hover key={row.id}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <ActionEdit
                                                onEdit={() => navigate(`/users/edit/${row.id}`)}
                                                message="Edit User"
                                                disabled={!hasPermission("Update Users")}
                                            />
                                            <ActionDelete
                                                link={`${import.meta.env.VITE_API_URL}/users/delete/${row.id}`}
                                                onDelete={fetchUsers}
                                                message="Users deleted successfully"
                                                disabled={!hasPermission("Delete Users")}
                                            />
                                            {hasPermission("Update Users") ? (
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="primary"
                                                    onClick={() => navigate(`/users/${row.id}/permissions`)}
                                                    sx={{
                                                        minWidth: 'auto',
                                                        padding: '4px 8px',
                                                        fontSize: '0.75rem'
                                                    }}
                                                >
                                                    Permissions
                                                </Button>
                                            ) : null}
                                        </Box>
                                    </TableCell>
                                    <TableCell>{row.id}</TableCell>
                                    <TableCell>
                                        {row.username?.replace(/<[^>]+>/g, "").slice(0, 50)}
                                        {row.username?.length > 50 ? "..." : ""}
                                    </TableCell>

                                    <TableCell>
                                        {row.email
                                            ? row.email
                                                .replace(/<[^>]+>/g, "")
                                                .slice(0, 200) +
                                            (row.email.length > 200 ? "..." : "")
                                            : ""}
                                    </TableCell>

                                    <TableCell>
                                        {row.role_id
                                            ? String(row.role_id)
                                                .replace(/<[^>]+>/g, "")
                                                .slice(0, 200) +
                                            (String(row.role_id).length > 200 ? "..." : "")
                                            : ""}
                                    </TableCell>

                                    <TableCell sx={{ padding: "4px 8px" }}>
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
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredRows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
    );
}
