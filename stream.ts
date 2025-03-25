import { Readable } from "stream";
import moment from "moment";

export const helper = {
  formatDate: (input: any): null | any => {
    return moment(input).format("DD/MM/YYYY");
  },
  wrapInQuotes: (value: string | undefined | null) => {
    return `"${value || "-"}"`;
  },
  formatTime: (input: any): null | any => {
    return input ? moment.utc(input, "HH:mm:ss").format("hh:mm A") : null;
  },
};

//generator function to return data from the database chunk by chunk
async function* generateData(queryOptions: any) {
  var index = 0;
  let data: User[] = [];
  // Prepare the CSV data as a string
  const csvHeader = [
    "ID,Date, Username, Password",
  ];
  const limit = 100; // limit can be customized based on the ram available
  while (true) {
    const offset = index * limit;
    // Getting data from database using sequelize
    data = await Users.findAll({
      where: queryOptions,
      limit: limit,
      offset: offset,
    });
    const csvRows = data?.map((row: any, ind) => {
      return [
        helper.wrapInQuotes(`${offset + (ind + 1)}`),
        // .
        // .
        // .
        // .
        // .
        // .
        // .
        // ..
        // ...
        // ....
      ].join(",");
    });
    const csvContent =
      index == 0
        ? csvHeader.concat(csvRows).join("\n") // appending header in the first iteration
        : "\n" + csvRows.join("\n"); // appending header in the first iteration
    index++;
    if (data.length == 0) break; // break the loop when the data from the db becomes empty string
    yield csvContent; // Send data in chunks
  }
}

export async function POST(request: Request) {
  try {
    const queryOptions = null;
    const stream = Readable.from(generateData(queryOptions)); // Convert generator to stream

    // Set response headers for streaming the csv
    return new Response(stream as any, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'inline; filename="export.csv"',
      },
    });
  } catch (e) {
    console.log(e);
    //return error response
  }
}
