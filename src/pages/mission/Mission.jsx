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
    TextField,
    useMediaQuery,
    useTheme,
    OutlinedInput,
    FormControl,
    InputLabel,
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
    { id: "image", label: "Image", width: 150 },
    { id: "mission", label: "Mission", width: 500 },
    { id: "value", label: "Value", width: 500 },
    { id: "history", label: "History", width: 500 },
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

export default function Mission() {
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

    const navigate = useNavigate();
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down("sm")); // small screen
    const { hasPermission } = useAuth();
    React.useEffect(() => {
        fetchMissions();
    }, []);

    const fetchMissions = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("User not logged in");

            const res = await fetch(`${import.meta.env.VITE_API_URL}/missions/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch mission");

            const data = await res.json();
            const mappedData = data.map((cat) => ({
                ...cat,
                image: `${import.meta.env.VITE_API_URL}/uploads/${cat.path}`,
            }));
            setRows(mappedData);
            setFilteredRows(mappedData);
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

    // Search function
    const handleSearch = () => {
        let filtered = [...rows];

        // filter by name
        if (searchName) {
            filtered = filtered.filter((row) =>
                row.name.toLowerCase().includes(searchName.toLowerCase())
            );
        }

        // filter by date
        if (startDate) {
            filtered = filtered.filter(
                (row) => new Date(row.created_at) >= startDate.toDate()
            );
        }
        if (endDate) {
            filtered = filtered.filter(
                (row) => new Date(row.created_at) <= endDate.toDate()
            );
        }

        setFilteredRows(filtered);
        setPage(0); // reset page
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
            <ActiveLastBreadcrumb label={"Mission"} endpoint={"List Mission"} />
            <Paper sx={{ width: "100%", mb: 2 }}>
                <Box sx={{ padding: "5px 16px" }}>
                    <Header title="Mission" subtitle="List of Mission" />
                </Box>

                {/* Create Button */}
                <Box sx={{ padding: '5px 16px' }}>
                    {hasPermission("Create Missions") ? (
                        <Link to="/mission/add" style={{ textDecoration: "none" }}>
                            <Button variant="contained">Create Mission</Button>
                        </Link>
                    ) : (
                        <Button variant="contained" disabled>
                            Create Mission
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
                    <FormControl sx={{ width: '35%' }}>
                        <OutlinedInput
                            // label="Search Name"
                            // variant="outlined"
                            placeholder="Mission Name"
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

                <TableContainer sx={{ maxHeight: isSmall ? 400 : "auto" }}>
                    <Table size="small" stickyHeader={isSmall} sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow>
                                {headCells.map((headCell) => {
                                    if (isSmall && ["discriptions", "image"].includes(headCell.id))
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
                                        <ActionEdit
                                            onEdit={() =>
                                                navigate(`/mission/edit/${row.id}`)
                                            }
                                            message="Edit Mission"
                                            disabled={!hasPermission("Update Missions")}
                                        />
                                        <ActionDelete
                                            link={`${import.meta.env.VITE_API_URL}/missions/delete/${row.id}`}
                                            onDelete={fetchMissions}
                                            message="Mission deleted successfully"
                                            disabled={!hasPermission("Delete Missions")}
                                        />
                                    </TableCell>
                                    <TableCell>{row.id}</TableCell>
                                    {!isSmall && (
                                        <TableCell>
                                            <img
                                                src={row.image}
                                                alt={row.name}
                                                style={{
                                                    width: 100,
                                                    height: 30,
                                                    objectFit: "cover",
                                                }}
                                            />
                                        </TableCell>
                                    )}

                                    {!isSmall && (
                                        <TableCell>
                                            {row.mission
                                                ? row.mission
                                                    .replace(/<[^>]+>/g, "")
                                                    .slice(0, 100) +
                                                (row.mission.length > 100 ? "..." : "")
                                                : ""}
                                        </TableCell>
                                    )}



                                    {!isSmall && (
                                        <TableCell>
                                            {row.value
                                                ? row.value
                                                    .replace(/<[^>]+>/g, "")
                                                    .slice(0, 100) +
                                                (row.value.length > 100 ? "..." : "")
                                                : ""}
                                        </TableCell>
                                    )}

                                    {!isSmall && (
                                        <TableCell>
                                            {row.history
                                                ? row.history
                                                    .replace(/<[^>]+>/g, "")
                                                    .slice(0, 100) +
                                                (row.history.length > 100 ? "..." : "")
                                                : ""}
                                        </TableCell>
                                    )}

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
