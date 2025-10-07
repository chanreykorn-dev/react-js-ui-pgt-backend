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
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

const headCells = [
    { id: "action", label: "Action", width: 120 },
    { id: "id", label: "ID", width: 60 },
    { id: "name", label: "Name", width: 300 },
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

export default function Permission() {
    const [rows, setRows] = React.useState([]);
    const [filteredRows, setFilteredRows] = React.useState([]);
    const [order, setOrder] = React.useState("asc");
    const [orderBy, setOrderBy] = React.useState("name");
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [loading, setLoading] = React.useState(true);
    const [searchName, setSearchName] = React.useState("");
    const [startDate, setStartDate] = React.useState(null);
    const [endDate, setEndDate] = React.useState(null);
    const { hasPermission } = useAuth();

    const navigate = useNavigate();
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

    React.useEffect(() => {
        fetchPermissions();
    }, []);

    const fetchPermissions = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("User not logged in");

            const res = await fetch(`${import.meta.env.VITE_API_URL}/permissions/`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Failed to fetch permissions");

            const data = await res.json();
            setRows(data);
            setFilteredRows(data);
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Error fetching permissions");
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

    const handleSearch = () => {
        let filtered = [...rows];

        if (searchName) {
            filtered = filtered.filter((row) =>
                row.name.toLowerCase().includes(searchName.toLowerCase())
            );
        }

        if (startDate) {
            filtered = filtered.filter(
                (row) => new Date(row.created_at) >= startDate.startOf("day").toDate()
            );
        }

        if (endDate) {
            filtered = filtered.filter(
                (row) => new Date(row.created_at) <= endDate.endOf("day").toDate()
            );
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
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <Loading />
            </Box>
        );

    return (
        <Box sx={{ width: "100%" }}>
            <ToastContainer position="top-right" autoClose={3000} />
            <ActiveLastBreadcrumb label={"Permissions"} endpoint={"List Permissions"} />

            <Paper sx={{ width: "100%", mb: 2 }}>
                <Box sx={{ padding: "5px 16px" }}>
                    <Header name={"Permissions"} description={"Manage your permissions here."} />
                </Box>

                <Box sx={{ padding: "5px 16px" }}>
                    {/* <Link to="/permission/add" style={{ textDecoration: "none" }}>
                        <Button variant="contained">Create Permission</Button>
                    </Link> */}
                    {hasPermission("Create Permissions") ? (
                        <Link to="/permission/add">
                            <Button variant="contained">Create Permission</Button>
                        </Link>
                    ) : (
                        <Button variant="contained" disabled>
                            Create Permission
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
                            placeholder="Permission Name"
                            size="small"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
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

                {/* Table */}
                <TableContainer sx={{ maxHeight: isSmall ? 400 : "auto" }}>
                    <Table size="small" stickyHeader={isSmall} sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow>
                                {headCells.map((headCell) => (
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
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {visibleRows.map((row) => (
                                <TableRow hover key={row.id}>
                                    <TableCell>
                                        <ActionEdit
                                            onEdit={() => navigate(`/permission/edit/${row.id}`)}
                                            message="Edit Permission"
                                            disabled={!hasPermission("Update Permissions")}
                                        />
                                        <ActionDelete
                                            link={`${import.meta.env.VITE_API_URL}/permissions/delete/${row.id}`}
                                            onDelete={fetchPermissions}
                                            message="Permission deleted successfully"
                                            disabled={!hasPermission("Delete Permissions")}
                                        />
                                    </TableCell>
                                    <TableCell>{row.id}</TableCell>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell>
                                        {row.status === 1 ? "Active" : "Inactive"}
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
