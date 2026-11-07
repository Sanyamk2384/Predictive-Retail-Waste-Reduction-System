import { MdInventory2 } from 'react-icons/md';
import { IoIosAdd, IoIosArrowRoundUp } from 'react-icons/io';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './index.css';

function Inventory() {
  const items = [
    { id: uuidv4(), head: 'Total products', num: 123 },
    { id: uuidv4(), head: 'Categories', num: 234 },
    { id: uuidv4(), head: 'Low Stock', num: 345 },
  ];

  const columns = [
    'Id',
    'ProductId',
    'BatchId',
    'StoreId',
    'Quantity Remaining',
    'Initial Quantity',
    'Expiration Date',
    'Received Date',
    'Created At',
    'Received At',
  ];

  const sampleBatches = [
    {
      _id: '66b1a2f3e4b0a1c2d3e4f501',
      productId: '66b1a100e4b0a1c2d3e4f401',
      batchId: 'BAT-2026-001',
      storeId: '66b1a050e4b0a1c2d3e4f301',
      quantityRemaining: 45,
      initialQuantity: 100,
      expirationDate: '2026-12-15T00:00:00.000Z',
      receivedDate: '2026-01-10T00:00:00.000Z',
      createdAt: '2026-01-10T08:30:00.000Z',
      updatedAt: '2026-02-01T14:20:00.000Z',
    },
    {
      _id: '66b1a2f3e4b0a1c2d3e4f502',
      productId: '66b1a100e4b0a1c2d3e4f401',
      batchId: 'BAT-2026-002',
      storeId: '66b1a050e4b0a1c2d3e4f301',
      quantityRemaining: 120,
      initialQuantity: 150,
      expirationDate: '2027-03-20T00:00:00.000Z',
      receivedDate: '2026-02-05T00:00:00.000Z',
      createdAt: '2026-02-05T09:15:00.000Z',
      updatedAt: '2026-02-18T11:00:00.000Z',
    },
    {
      _id: '66b1a2f3e4b0a1c2d3e4f503',
      productId: '66b1a100e4b0a1c2d3e4f402',
      batchId: 'BAT-2026-003',
      storeId: '66b1a050e4b0a1c2d3e4f302',
      quantityRemaining: 0,
      initialQuantity: 50,
      expirationDate: '2026-06-30T00:00:00.000Z',
      receivedDate: '2025-12-01T00:00:00.000Z',
      createdAt: '2025-12-01T10:00:00.000Z',
      updatedAt: '2026-01-25T16:45:00.000Z',
    },
    {
      _id: '66b1a2f3e4b0a1c2d3e4f504',
      productId: '66b1a100e4b0a1c2d3e4f403',
      batchId: 'BAT-2026-004',
      storeId: '66b1a050e4b0a1c2d3e4f301',
      quantityRemaining: 80,
      initialQuantity: 80,
      expirationDate: '2026-11-10T00:00:00.000Z',
      receivedDate: '2026-03-01T00:00:00.000Z',
      createdAt: '2026-03-01T07:45:00.000Z',
      updatedAt: '2026-03-01T07:45:00.000Z',
    },
    {
      _id: '66b1a2f3e4b0a1c2d3e4f505',
      productId: '66b1a100e4b0a1c2d3e4f404',
      batchId: 'BAT-2026-005',
      storeId: '66b1a050e4b0a1c2d3e4f303',
      quantityRemaining: 12,
      initialQuantity: 200,
      expirationDate: '2026-05-18T00:00:00.000Z',
      receivedDate: '2025-11-15T00:00:00.000Z',
      createdAt: '2025-11-15T11:20:00.000Z',
      updatedAt: '2026-03-10T13:10:00.000Z',
    },
    {
      _id: '66b1a2f3e4b0a1c2d3e4f506',
      productId: '66b1a100e4b0a1c2d3e4f402',
      batchId: 'BAT-2026-006',
      storeId: '66b1a050e4b0a1c2d3e4f302',
      quantityRemaining: 300,
      initialQuantity: 300,
      expirationDate: '2027-08-01T00:00:00.000Z',
      receivedDate: '2026-03-12T00:00:00.000Z',
      createdAt: '2026-03-12T15:00:00.000Z',
      updatedAt: '2026-03-12T15:00:00.000Z',
    },
    {
      _id: '66b1a2f3e4b0a1c2d3e4f507',
      productId: '66b1a100e4b0a1c2d3e4f405',
      batchId: 'BAT-2026-007',
      storeId: '66b1a050e4b0a1c2d3e4f301',
      quantityRemaining: 5,
      initialQuantity: 60,
      expirationDate: '2026-04-01T00:00:00.000Z',
      receivedDate: '2026-01-05T00:00:00.000Z',
      createdAt: '2026-01-05T12:00:00.000Z',
      updatedAt: '2026-03-20T10:30:00.000Z',
    },
    {
      _id: '66b1a2f3e4b0a1c2d3e4f508',
      productId: '66b1a100e4b0a1c2d3e4f403',
      batchId: 'BAT-2026-008',
      storeId: '66b1a050e4b0a1c2d3e4f303',
      quantityRemaining: 75,
      initialQuantity: 100,
      expirationDate: '2027-01-15T00:00:00.000Z',
      receivedDate: '2026-02-20T00:00:00.000Z',
      createdAt: '2026-02-20T09:40:00.000Z',
      updatedAt: '2026-03-05T14:15:00.000Z',
    },
    {
      _id: '66b1a2f3e4b0a1c2d3e4f509',
      productId: '66b1a100e4b0a1c2d3e4f406',
      batchId: 'BAT-2026-009',
      storeId: '66b1a050e4b0a1c2d3e4f302',
      quantityRemaining: 210,
      initialQuantity: 250,
      expirationDate: '2027-06-30T00:00:00.000Z',
      receivedDate: '2026-03-05T00:00:00.000Z',
      createdAt: '2026-03-05T08:10:00.000Z',
      updatedAt: '2026-03-22T17:00:00.000Z',
    },
    {
      _id: '66b1a2f3e4b0a1c2d3e4f510',
      productId: '66b1a100e4b0a1c2d3e4f401',
      batchId: 'BAT-2026-010',
      storeId: '66b1a050e4b0a1c2d3e4f303',
      quantityRemaining: 90,
      initialQuantity: 90,
      expirationDate: '2027-10-10T00:00:00.000Z',
      receivedDate: '2026-03-25T00:00:00.000Z',
      createdAt: '2026-03-25T13:50:00.000Z',
      updatedAt: '2026-03-25T13:50:00.000Z',
    },
  ];

  const records = [
    {
      id: uuidv4(),
      name: 'product1',
      productId: 'productId1',
      shelfLife: 'shelfLife1',
    },
    {
      id: uuidv4(),
      name: 'product2',
      productId: 'productId2',
      shelfLife: 'shelfLife2',
    },
  ];

  return (
    <div>
      <div className="flex flex-row justify-start items-center ml-8">
        <MdInventory2 className="product" />
        <div className="p-4">
          <h1 className="font-bold text-3xl ">Inventory</h1>
          <p className="font-normal text-lg">
            Manage your Inventory smartly and efficiently.
          </p>
        </div>
      </div>
      <div className="flex flex-row justify-between mx-12 my-5">
        {items.map((each) => (
          <div key={each.id}>
            <h2 className="font-normal text-lg">{each.head}</h2>
            <p className="font-medium text-2xl pl-0.5">{each.num}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-row ml-10 my-6">
        <button className="flex flex-row justify-center items-center w-40 h-12 bg-gray-200 rounded-xl text-green-400 font-medium mr-4">
          <IoIosArrowRoundUp className="icons mr-1" />
          Import CSV{' '}
        </button>
        <button className="flex flex-row justify-center items-center w-40 h-12 bg-green-400 rounded-xl text-white font-medium">
          {' '}
          <IoIosAdd className="icons mr-1" /> Add product
        </button>
      </div>
      <div className="border border-gray-300 m-10"></div>
      <div className="mx-12">
        <h3 className="text-2xl font-medium font-sans">Inventory Data </h3>
        <div className="flex flex-row justify-between items-center my-6">
          {columns.map((each) => (
            <p key={each} className="text-lg font-normal font-sans ">
              {each}
            </p>
          ))}
        </div>
        <div className="border border-gray-100"></div>
        <div>
          {sampleBatches.map((each) => {
            return (
              <div
                className="flex flex-row justify-between py-1.5 text-sm font-medium"
                key={each._id}
              >
                <p>{each._id}</p>
                <p>{each.productId}</p>
                <p>{each.batchId}</p>
                <p>{each.storeId}</p>
                <p>{each.createdAt}</p>
                <p>{each.quantityRemaining}</p>
                <p>{each.initialQuantity}</p>
                <p>{each.expirationDate}</p>
                <p>{each.receivedDate}</p>
                <p>{each.createdAt}</p>
                <p>{each.updatedAt}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Inventory;
