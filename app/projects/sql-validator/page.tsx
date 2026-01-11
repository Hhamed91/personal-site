"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Database, Play, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatSqlErrorDetails, validateSqlQuery } from "@/lib/sql/validateSql";

const instructions = [
  "Paste your SQL query in the input area",
  "Click the 'VALIDATE' button",
  "View the validation result in the output area",
];

const sampleSql = `SELECT employees.name, departments.name AS department_name
FROM employees
JOIN departments ON employees.department_id = departments.id
WHERE employees.hire_date > '2023-01-01'
ORDER BY employees.name ASC;`;

type SampleTable = {
  name: string;
  records: number;
  query: string;
  columns: string[];
  rows: string[][];
};

const sampleTables: SampleTable[] = [
  {
    name: "Customers",
    records: 91,
    query: "SELECT * FROM Customers LIMIT 2;",
    columns: [
      "CustomerID",
      "CustomerName",
      "ContactName",
      "Address",
      "City",
      "PostalCode",
      "CountryDesign",
    ],
    rows: [
      ["ALFKI", "Alfreds Futterkiste", "Maria Anders", "Obere Str. 57", "Berlin", "12209", "Germany"],
      ["ANATR", "Ana Trujillo Emparedados", "Ana Trujillo", "Avda. de la Constitucion 2222", "Mexico D.F.", "05021", "Mexico"],
    ],
  },
  {
    name: "Categories",
    records: 8,
    query: "SELECT * FROM Categories LIMIT 2;",
    columns: ["CategoryID", "CategoryName", "Description"],
    rows: [
      ["1", "Beverages", "Soft drinks, coffees, teas, beers, and ales"],
      ["2", "Condiments", "Sweet and savory sauces, relishes, spreads, and seasonings"],
    ],
  },
  {
    name: "Employees",
    records: 10,
    query: "SELECT * FROM Employees LIMIT 2;",
    columns: ["EmployeeID", "FirstName", "LastName", "Title", "City", "Country"],
    rows: [
      ["1", "Nancy", "Davolio", "Sales Representative", "Seattle", "USA"],
      ["2", "Andrew", "Fuller", "Vice President, Sales", "Tacoma", "USA"],
    ],
  },
  {
    name: "OrderDetails",
    records: 518,
    query: "SELECT * FROM OrderDetails LIMIT 2;",
    columns: ["OrderID", "ProductID", "UnitPrice", "Quantity", "Discount"],
    rows: [
      ["10248", "11", "14.00", "12", "0"],
      ["10248", "42", "9.80", "10", "0"],
    ],
  },
  {
    name: "Orders",
    records: 196,
    query: "SELECT * FROM Orders LIMIT 2;",
    columns: ["OrderID", "CustomerID", "EmployeeID", "OrderDate", "ShipCity", "ShipCountry"],
    rows: [
      ["10248", "VINET", "5", "1996-07-04", "Reims", "France"],
      ["10249", "TOMSP", "6", "1996-07-05", "Munster", "Germany"],
    ],
  },
  {
    name: "Products",
    records: 77,
    query: "SELECT * FROM Products LIMIT 2;",
    columns: ["ProductID", "ProductName", "SupplierID", "CategoryID", "UnitPrice", "UnitsInStock"],
    rows: [
      ["1", "Chai", "1", "1", "18.00", "39"],
      ["2", "Chang", "1", "1", "19.00", "17"],
    ],
  },
  {
    name: "Shippers",
    records: 3,
    query: "SELECT * FROM Shippers LIMIT 2;",
    columns: ["ShipperID", "ShipperName", "Phone"],
    rows: [
      ["1", "Speedy Express", "(503) 555-9831"],
      ["2", "United Package", "(503) 555-3199"],
    ],
  },
  {
    name: "Suppliers",
    records: 29,
    query: "SELECT * FROM Suppliers LIMIT 2;",
    columns: ["SupplierID", "CompanyName", "ContactName", "City", "Country"],
    rows: [
      ["1", "Exotic Liquids", "Charlotte Cooper", "London", "UK"],
      ["2", "New Orleans Cajun Delights", "Shelley Burke", "New Orleans", "USA"],
    ],
  },
];

type ValidationStatus = "idle" | "valid" | "invalid";

type ValidationState = {
  status: ValidationStatus;
  summary: string;
  details?: string;
};

const defaultValidation: ValidationState = {
  status: "idle",
  summary: "Run validation to see the syntax check here.",
};

export default function SqlValidatorPage() {
  const [sqlInput, setSqlInput] = useState("");
  const [validation, setValidation] = useState<ValidationState>(defaultValidation);
  const [selectedTable, setSelectedTable] = useState<SampleTable>(sampleTables[0]);
  const [copied, setCopied] = useState(false);

  const resultText = useMemo(() => {
    if (validation.status === "idle") {
      return "Validation Result\nRun validation to see the syntax check here.";
    }
    if (validation.status === "valid") {
      return `Validation Result\n${validation.summary}`;
    }
    return [
      "Validation Result",
      validation.summary,
      "The provided SQL query is not syntactically valid. Error details:",
      validation.details ?? "",
      "Please check your SQL query for syntax errors and try again.",
    ].join("\n\n");
  }, [validation]);

  const handleValidate = () => {
    const result = validateSqlQuery(sqlInput);
    if (result.valid) {
      setValidation({
        status: "valid",
        summary: "✅ Valid SQL Query",
      });
      return;
    }

    setValidation({
      status: "invalid",
      summary: "❌ Invalid SQL Query",
      details: formatSqlErrorDetails(sqlInput, result.error),
    });
  };

  const handleLoadSample = () => {
    setSqlInput(sampleSql);
    setValidation(defaultValidation);
  };

  const handleClear = () => {
    setSqlInput("");
    setValidation(defaultValidation);
  };

  const handleTableSelect = (table: SampleTable) => {
    setSelectedTable(table);
    setSqlInput(table.query);
    setValidation(defaultValidation);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="max-w-5xl mx-auto py-12 px-6 space-y-10">
      <nav className="flex gap-4 text-sm text-gray-500">
        <Link href="/" className="hover:underline">
          ← Home
        </Link>
        <span aria-hidden="true">•</span>
        <Link href="/projects" className="hover:underline">
          Projects
        </Link>
      </nav>

      <header className="space-y-4">
        <p className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-gray-500">
          <Database className="size-4" />
          SQL Playground
        </p>
        <h1 className="text-4xl font-bold">SQL Validator</h1>
        <p className="text-gray-600 max-w-2xl">
          Paste a query, run validation, and get a clean, copyable result. This feels
          like a playground but keeps the UX close to how analysts sanity-check SQL
          before running it.
        </p>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-400 pb-2">
            Instructions
          </p>
          <ul className="space-y-1 text-sm text-gray-600">
            {instructions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                SQL Input
              </p>
              <h2 className="text-xl font-semibold">Query editor</h2>
            </div>
            <textarea
              value={sqlInput}
              onChange={(event) => setSqlInput(event.target.value)}
              placeholder="SELECT * FROM customers WHERE country = 'Germany';"
              className="min-h-[220px] w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 shadow-inner focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            <div className="flex flex-wrap gap-3">
              <Button className="rounded-full" onClick={handleValidate}>
                <Play className="size-4" />
                VALIDATE
              </Button>
              <Button variant="outline" className="rounded-full" onClick={handleLoadSample}>
                Load Sample Data
              </Button>
              <Button variant="ghost" className="rounded-full" onClick={handleClear}>
                <RotateCcw className="size-4" />
                Clear
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              A SQL validator checks your queries for syntax errors, helps optimize
              performance, and can detect risky patterns like SQL injection.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Validation Result
                </p>
                <h2 className="text-xl font-semibold">Output panel</h2>
              </div>
              <Button variant="outline" className="rounded-full" onClick={handleCopy}>
                <Copy className="size-4" />
                {copied ? "Copied!" : "Copy result"}
              </Button>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 min-h-[220px]">
              <p
                className={
                  validation.status === "valid"
                    ? "text-emerald-600 font-semibold"
                    : validation.status === "invalid"
                      ? "text-red-600 font-semibold"
                      : "text-gray-500"
                }
              >
                {validation.summary}
              </p>
              {validation.status === "invalid" && (
                <div className="mt-4 space-y-3 text-gray-600">
                  <p>The provided SQL query is not syntactically valid. Error details:</p>
                  <pre className="rounded-xl bg-gray-900 p-4 text-xs text-gray-100 overflow-x-auto whitespace-pre-wrap">
                    {validation.details}
                  </pre>
                  <p>Please check your SQL query for syntax errors and try again.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Your Database
              </p>
              <h2 className="text-xl font-semibold">Tablenames & Records</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border">
                <thead>
                  <tr className="bg-gray-50 text-gray-500">
                    <th className="p-2 border">Tablenames</th>
                    <th className="p-2 border">Records</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleTables.map((table) => {
                    const isActive = table.name === selectedTable.name;
                    return (
                      <tr
                        key={table.name}
                        className={isActive ? "bg-gray-100 text-gray-900" : "text-gray-600"}
                      >
                        <td className="p-2 border">
                          <button
                            type="button"
                            onClick={() => handleTableSelect(table)}
                            className="w-full text-left font-medium hover:underline"
                          >
                            {table.name}
                          </button>
                        </td>
                        <td className="p-2 border">{table.records}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500">
              Click a table name to load a valid sample query and preview data.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Results
              </p>
              <h2 className="text-xl font-semibold">Query preview</h2>
            </div>
            <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
              Number of Records: {selectedTable.records}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border">
                <thead>
                  <tr className="bg-gray-50 text-gray-500">
                    {selectedTable.columns.map((key) => (
                      <th key={key} className="p-2 border">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedTable.rows.map((row) => (
                    <tr key={row.join("-")} className="text-gray-600">
                      {row.map((value, index) => (
                        <td key={`${value}-${index}`} className="p-2 border">
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-wrap gap-3">
        <Link href="/projects">
          <Button variant="outline" className="rounded-full">
            <ArrowLeft className="size-4" />
            Back to projects
          </Button>
        </Link>
      </section>
    </main>
  );
}
