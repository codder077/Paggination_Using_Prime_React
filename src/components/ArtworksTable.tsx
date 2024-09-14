import React, { useEffect, useState } from 'react';
import { DataTable, DataTableSelectionChangeParams } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import axios from 'axios';

interface Artwork {
    id: number;
    title: string;
    place_of_origin: string;
    artist_display: string;
    inscriptions: string;
    date_start: number;
    date_end: number;
}

const ArtworksTable: React.FC = () => {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [first, setFirst] = useState(0);
    const [selectRowsInput, setSelectRowsInput] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const fetchArtworks = async (page: number = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${page}&limit=10`);
            const { data } = response.data;
            setArtworks(data.map((item: any) => ({
                id: item.id,
                title: item.title,
                place_of_origin: item.place_of_origin,
                artist_display: item.artist_display,
                inscriptions: item.inscriptions,
                date_start: item.date_start,
                date_end: item.date_end
            })));
            setTotalRecords(response.data.pagination.total);
        } catch (error) {
            console.error("Error fetching artworks: ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArtworks(1);
    }, []);

    const onPageChange = (event: any) => {
        const newPage = event.first / 10 + 1;
        setFirst(event.first);
        setCurrentPage(newPage);
        fetchArtworks(newPage);
    };

    const onSelectionChange = (e: DataTableSelectionChangeParams) => {
        setSelectedArtworks(e.value);
    };

    const handleSelectRows = async () => {
        const numRows = parseInt(selectRowsInput, 10);
        if (isNaN(numRows) || numRows <= 0) return;

        let newSelection: Artwork[] = [];
        let remainingRows = numRows;
        let page = 1;

        while (remainingRows > 0) {
            const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${page}&limit=10`);
            const pageArtworks = response.data.data.map((item: any) => ({
                id: item.id,
                title: item.title,
                place_of_origin: item.place_of_origin,
                artist_display: item.artist_display,
                inscriptions: item.inscriptions,
                date_start: item.date_start,
                date_end: item.date_end
            }));
            
            for (let i = 0; i < pageArtworks.length && remainingRows > 0; i++) {
                newSelection.push(pageArtworks[i]);
                remainingRows--;
            }
            
            page++;
            if (page > Math.ceil(totalRecords / 10)) break;
        }

        setSelectedArtworks(newSelection);
        setSelectRowsInput('');
        setFirst(0);
        setCurrentPage(1);
        fetchArtworks(1);
    };

    return (
        <div>
            <div className="p-d-flex p-ai-center p-mb-3">
                <InputText
                    value={selectRowsInput}
                    onChange={(e) => setSelectRowsInput(e.target.value)}
                    placeholder="Number of rows to select"
                    className="p-mr-2"
                />
                <Button label="Select Rows" onClick={handleSelectRows} className="select-rows-button"  />
            </div>
            <DataTable
                value={artworks}
                paginator
                rows={10}
                totalRecords={totalRecords}
                lazy
                first={first}
                onPage={onPageChange}
                loading={loading}
                selection={selectedArtworks}
                onSelectionChange={onSelectionChange}
                dataKey="id"
                selectionMode="checkbox"
            >
                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                <Column field="title" header="Title" sortable></Column>
                <Column field="place_of_origin" header="Place of Origin" sortable></Column>
                <Column field="artist_display" header="Artist Display" sortable></Column>
                <Column field="inscriptions" header="Inscriptions" sortable></Column>
                <Column field="date_start" header="Start Date" sortable></Column>
                <Column field="date_end" header="End Date" sortable></Column>
            </DataTable>

            <div className="custom-panel">
                <h4>Selected Artworks ({selectedArtworks.length})</h4>
                {selectedArtworks.length > 0 ? (
                    <ul>
                        {selectedArtworks.map((artwork) => (
                            <li key={artwork.id}>{artwork.title}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No artwork selected</p>
                )}
            </div>
        </div>
    );
};

export default ArtworksTable;