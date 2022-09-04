import React, { useState, useEffect, useRef } from 'react'
import Header from '../components/header'
import Sidebar from '../components/sidebar'
import Head from 'next/head'
import Link from 'next/link'
import DataTable from 'react-data-table-component';
import { ExportToCsv } from 'export-to-csv';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/router'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TbDatabaseImport, TbDownload } from 'react-icons/tb';
import { VscDiffAdded } from 'react-icons/vsc';
import { FaEdit } from 'react-icons/fa';
import { RiDeleteBin6Line } from 'react-icons/ri';



const ViewContact = () => {
    const ref = useRef("");
    const closeRef = useRef("");
    // const [selectedData, setSelectedData] = useState();
    const [user, setUser] = useState([])
    const getContact = async () => {
        const req = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/viewusers`, {
            method: 'GET', // or 'PUT'
            headers: {
                'Content-Type': 'application/json',
            },
        })
        const u = await req.json()
        setUser(u);
        setFillteredName(u)
    }
    useEffect(() => {
        getContact()
    }, [])


    // Filter 
    const [search, setSearch] = useState("")
    const [fillteredName, setFillteredName] = useState([])
    useEffect(() => {
        const result = user.filter(use =>{
            return use.Name.toLowerCase().match(search.toLowerCase()) || use.Contact.toLowerCase().match(search.toLowerCase())
        })
        setFillteredName(result)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search])
    // const handleDelete = ()=>{

    // }
    const [excelFile, setExcelFile] = useState(null);
    const [excelFileError, setExcelFileError] = useState(null)

    // console.log(excelFile)

    const [excelData, setExcelData] = useState(null);
    const fileType = ['application/vnd.ms-excel', 'text/csv'];
    const handleFile = async (e) => {
        ref.current.innerHTML = 'Please Wait...'
        setTimeout(() => {
            ref.current.disabled = false;
            ref.current.click();
            ref.current.innerHTML = 'Upload'
        }, 1000);
        let selectedFile = await e.target.files[0];
        if (selectedFile) {
            // console.log(selectedFile.type)
            if (selectedFile && fileType.includes(selectedFile.type)) {
                let reader = new FileReader();
                reader.readAsArrayBuffer(selectedFile);
                reader.onload = async (e) => {
                    setExcelFileError(null);
                    setExcelFile(e.target.result);
                }
            }
            else {
                setExcelFileError("Please select only excel file types");
                setExcelFile(null);
            }
        }
        else {
            // console.log("Please select file");
        }

    }


    const router = useRouter();
    // Submit file 
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (excelFile !== null) {
            const workbook = XLSX.read(excelFile, { type: 'buffer' });
            const worksheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[worksheetName];
            const data = XLSX.utils.sheet_to_json(worksheet)
            setExcelData(data)

            // console.log(excelData);
            try {
                const req = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/importContact`, {
                    method: 'POST', // or 'PUT'
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(excelData),
                })
                const res = await req.json();
                // console.log(res)
                window.location.reload()
                if (res.errorCount == 0) {

                    toast.success('Contact imported successfully.', {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });
                    setTimeout(() => {
                        // window.location.reload()
                        router.push('/viewcontact')
                    }, 5000);
                }
                else {
                    toast.error(`${errorCount} records not imported`, {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });
                    setTimeout(() => {
                        // window.location.reload()
                        router.push('/viewcontact')
                    }, 4000);
                }
            }
            catch (error) {

            }

        }
        else {
            setExcelData(null)
        }
    }


    const columns = [
        {
            name: 'Name',
            selector: row => row.Name,
            sortable: true,
        },
        {
            name: 'Email',
            selector: row => row.Email,
            sortable: true,
        },
        {
            name: 'Contact',
            selector: row => row.Contact,
            sortable: true,
        },
        {
            name: 'Date',
            selector: row => row.Date,
            sortable: true,
        },
        {
            name: 'Time',
            selector: row => row.Time,
            sortable: true,
        },
        {
            name: "Action",
            cell: (row) => (<div>
                <Link href={`/contactedit/${row.Id}`}><a className='btn btn-primary btn-sm'><FaEdit className='text fs-5' /></a></Link>
                <Link href={`/contact-delete/${row.Id}`}><a className='btn btn-primary btn-sm mx-1'><RiDeleteBin6Line className='text fs-5' /></a></Link>
            </div>)
        },


    ];

    // const data = [
    //     {
    //         name: 'Divy',
    //         email: 'this@this.com',
    //         contact: 111111111,
    //         createdAt: '1988',
    //     }
    // ]

    // const handleChange = (state) => {
    //     setSelectedData(state.selectedRows);
    //     console.log(selectedData);
    //   };
    const exportReport = () => {
        const options = {
            fieldSeparator: ',',
            quoteStrings: '"',
            decimalSeparator: '.',
            showLabels: true,
            showTitle: true,
            title: 'Contact Reports',
            useTextFile: false,
            useBom: true,
            useKeysAsHeaders: true,
            headers: ['name', 'email', 'contact', 'createdAt']
        };

        const csvExporter = new ExportToCsv(options);

        csvExporter.generateCsv(user);
    }
    return (
        <>
            <Head>
                <title>View Contacts - SMS Portal App</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header />
            <Sidebar />
            <main id="main" className="main">
                <ToastContainer
                    position="top-center"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
                <div className="row">
                    <div className="d-flex justify-content-between">
                        <div className="pagetitle">
                            <h1>View Contacts</h1>
                            <nav>
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item"> <Link href={'/'}><a>Home</a></Link></li>
                                    <li className="breadcrumb-item active">Contact</li>
                                    <li className="breadcrumb-item active">View Contact</li>
                                </ol>
                            </nav>
                        </div>
                        <div>
                            <Link href={'/add-contact'}><a className="btn btn-primary btn-sm"> <VscDiffAdded className="text fs-5" /> Add</a></Link>
                        </div>
                    </div>
                </div>

                <div className="container">
                    <DataTable
                        columns={columns}
                        data={fillteredName}
                        pagination
                        fixedHeader
                        fixedHeaderScrollHeight='750px'
                        // selectableRows
                        selectableRowsHighlight
                        highlightOnHover
                        subHeader
                        subHeaderComponent={<input className="form-control me-2" type="search" placeholder="Search By Name Or Contact" aria-label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />}
                        actions={<>
                            <button className='btn btn-primary mx-2 btn-sm' data-bs-toggle="modal" data-bs-target="#staticBackdrop"><TbDatabaseImport className='text fs-5' /> Import</button>
                            <button className='btn btn-primary btn-sm' onClick={exportReport} > <TbDownload className='text fs-5' /> Export</button>
                            <a href='/assets/csv/csv_format.csv' className='btn btn-primary btn-sm'> <TbDownload className='text fs-5' /> Download CSV Format</a>
                        </>}
                    // onSelectedRowsChange={handleChange}
                    />

                    {/* Modal  */}
                    <div className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <form method="post" onSubmit={handleSubmit}>
                                    <div className="modal-header">
                                        <h5 className="modal-title" id="staticBackdropLabel">Upload Excel File</h5>
                                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                    </div>
                                    <div className="modal-body">
                                        <div className="input-group mb-3">
                                            <input onChange={handleFile} type="file" className="form-control" id="inputGroupFile02" required />
                                            <label className="input-group-text" htmlFor="inputGroupFile02">Upload</label>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" ref={closeRef}>Close</button>
                                        <button type="submit" className="btn btn-primary" ref={ref} disabled={true}>Upload</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}

// export async function getServerSideProps() {
//     const req = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/viewusers`, {
//         method: 'GET', // or 'PUT'
//         headers: {
//             'Content-Type': 'application/json',
//         },
//     })
//     const u = await req.json()
//     return {
//         props: { users: JSON.parse(JSON.stringify(u)) }, // will be passed to the page component as props
//     }
// }

export default ViewContact
