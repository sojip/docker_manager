import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { useState, useContext } from "react";
import { DateTime } from "luxon";
import uuid from "react-uuid";
import { SelectedShiftContext } from "./Shifts";

const columns = [
  { id: "type", label: "Type", minWidth: 100 },
  {
    id: "startdate",
    label: "Start",
    minWidth: 170,
    format: (value) =>
      DateTime.fromISO(value).setLocale("fr").toLocaleString({
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
  },
  {
    id: "enddate",
    label: "End",
    minWidth: 170,
    format: (value) =>
      DateTime.fromISO(value).setLocale("fr").toLocaleString({
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
  },
  {
    id: "status",
    label: "Status",
    minWidth: 170,
    align: "right",
  },
  //   {
  //     id: "size",
  //     label: "Size\u00a0(km\u00b2)",
  //     minWidth: 170,
  //     align: "right",
  //     format: (value) => value.toLocaleString("en-US"),
  //   },
  //   {
  //     id: "density",
  //     label: "Density",
  //     minWidth: 170,
  //     align: "right",
  //     format: (value) => value.toFixed(2),
  //   },
];

export default function StickyHeadTable(props) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { shifts } = props;
  const { handleOpen } = props;
  const { setshowShift } = props;
  const { setselectedshift } = useContext(SelectedShiftContext);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  function handleClick(e) {
    handleOpen();
    setshowShift(true);
    // setselectedshift(e.currentTarget.id);
    setselectedshift(shifts.find((shift) => shift._id === e.currentTarget.id));
  }

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: 400 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth, fontWeight: "bold" }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {shifts
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((shift) => {
                return (
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={shift._id}
                    id={shift._id}
                    style={{ cursor: "pointer" }}
                    onClick={handleClick}
                  >
                    {columns.map((column) => {
                      const value = shift[column.id];
                      return (
                        <TableCell key={uuid()} align={column.align}>
                          {column.format ? column.format(value) : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={shifts.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
