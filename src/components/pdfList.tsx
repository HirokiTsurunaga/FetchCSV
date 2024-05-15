import React, { useState, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import Papa from 'papaparse';

interface PDFData {
  title: string;
  path: string;
  updateAt: string;
  createAt: string;
  keywords: string;
}

const PDFList: React.FC = () => {
  const [data, setData] = useState<PDFData[]>([]);
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingAllData, setLoadingAllData] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // 初期データのフェッチ
    const fetchInitialData = async () => {
      try {
        const response = await fetch('/initial-data.csv');
        console.log(response);
        const csvData = await response.text();
        const parsedData = Papa.parse<PDFData>(csvData, { header: true }).data;
        console.log(csvData);
        setData(parsedData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    // 全体データのフェッチ
    const fetchAllData = async () => {
      try {
        const response = await fetch('/all-data.csv');
        const csvData = await response.text();
        const parsedData = Papa.parse<PDFData>(csvData, { header: true }).data;
        console.log(parsedData);
        setData(parsedData);
      } catch (error) {
        console.error('Error fetching all data:', error);
      } finally {
        setLoadingAllData(false);
      }
    };

    fetchInitialData();
    fetchAllData();
  }, []);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  //   const handleSearch = (e: KeyboardEvent<HTMLInputElement>) => {
  //     if (e.key === 'Enter') {
  //       setCurrentPage(1); // 検索時にページをリセット
  //     }
  //   };

  const filteredData = data.filter(
    (pdf) =>
      pdf.title.toLowerCase().includes(query.toLowerCase()) ||
      pdf.keywords.toLowerCase().includes(query.toLowerCase()),
  );

  const displayedData = query ? filteredData : data;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = displayedData.slice(startIndex, endIndex);
  const currentMaxPage = Math.floor(displayedData.length / itemsPerPage) + 1;

  return (
    <div>
      <h1 className=" font-bold  text-2xl my-3">ページタイトル</h1>
      <input
        type="text"
        value={query}
        className=" border"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setQuery(e.target.value);
          setCurrentPage(1);
        }}
        // onKeyPress={handleSearch} // エンターキーで検索
        placeholder="検索キーワードを入力"
      />
      {loading ? (
        <div>Now Loading...</div>
      ) : (
        <div className="flex justify-center mt-3">
          <table className=" table-fixed w-full">
            <thead>
              <tr>
                <th className=" max-w-fit">pdfタイトル</th>
                <th className=" w-20">更新日</th>
                <th className=" w-20">作成日</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((pdf, index) => (
                <tr key={index} className=" hover:bg-emerald-300">
                  <td className=" flex justify-start">
                    <button>
                      <a
                        href={pdf.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className=" text-start"
                      >
                        {pdf.title}
                      </a>
                    </button>
                  </td>
                  <td>{pdf.updateAt}</td>
                  <td>{pdf.createAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {loadingAllData && <div>Loading all data for search...</div>}
      <div>
        <button
          className=" mx-3  px-2 border disabled:border-none disabled:text-gray-200"
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          {'<'}
        </button>
        <button
          className=" mx-3 px-2 border disabled:border-none disabled:text-gray-200"
          onClick={handleNextPage}
          disabled={endIndex >= displayedData.length}
        >
          {'>'}
        </button>
      </div>
      <p>
        {currentPage}/{currentMaxPage}
      </p>
    </div>
  );
};

export default PDFList;
