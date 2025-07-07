"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAppContext } from "@/context/AppContext";
import Loading from "@/components/Loading";

const OutOfStockManager = () => {
  const { getToken, user } = useAppContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockInputs, setStockInputs] = useState({});
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fetchOutOfStockProducts = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/product/seller-list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        const outOfStock = data.products.filter((p) => p.stock === 0);
        setProducts(outOfStock);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (id, value) => {
    if (!id) return;
    const newStock = parseInt(value, 10);
    if (isNaN(newStock) || newStock < 0) return;

    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/seller/update-stock",
        { productId: id, newStock },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success("Stock updated");
        fetchOutOfStockProducts();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const deleteProduct = async (id) => {
    if (!id) return;
    try {
      const token = await getToken();
      const { data } = await axios.delete(`/api/seller/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        toast.success("Product deleted");
        fetchOutOfStockProducts();
        setConfirmDeleteId(null);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    if (user) fetchOutOfStockProducts();
  }, [user]);

  if (loading) return <Loading />;

  return (
    <div className="w-full md:p-10 p-4">
      <h2 className="pb-4 text-lg font-semibold text-red-600">Out of Stock Products</h2>
      {products.length === 0 ? (
        <p className="text-gray-600">All products are in stock.</p>
      ) : (
        <div className="flex flex-col items-center max-w-5xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
          <table className="table-fixed w-full">
            <thead className="text-gray-900 text-sm text-left">
              <tr>
                <th className="w-2/3 md:w-2/5 px-4 py-3 truncate">Product</th>
                <th className="px-4 py-3 max-sm:hidden">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3" colSpan={2}>Stock & Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {products.map((product) =>
                !product?._id ? null : (
                  <tr key={product._id} className="border-t border-gray-500/20">
                    <td className="px-4 py-3 flex items-center space-x-3 truncate">
                      <div className="bg-gray-500/10 rounded p-2">
                        <Image
                          src={product.image[0]}
                          alt={product.name}
                          width={64}
                          height={64}
                        />
                      </div>
                      <span className="truncate w-full">{product.name}</span>
                    </td>
                    <td className="px-4 py-3 max-sm:hidden">{product.category}</td>
                    <td className="px-4 py-3">${product.offerPrice}</td>
                    <td className="px-4 py-3" colSpan={2}>
                      <div className="flex flex-col gap-1 min-w-[280px]">
                        <span className="text-sm font-medium text-red-500">
                          Current Stock: {product.stock}
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <input
                            type="number"
                            placeholder="New stock"
                            className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                            value={stockInputs[product._id] || ""}
                            onChange={(e) =>
                              setStockInputs({
                                ...stockInputs,
                                [product._id]: e.target.value,
                              })
                            }
                          />
                          <button
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm"
                            onClick={() => updateStock(product._id, stockInputs[product._id])}
                          >
                            Update
                          </button>

                          {confirmDeleteId === product._id ? (
                            <>
                              <button
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm"
                                onClick={() => deleteProduct(product._id)}
                              >
                                Confirm Delete
                              </button>
                              <button
                                className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1.5 rounded text-sm"
                                onClick={() => setConfirmDeleteId(null)}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm"
                              onClick={() => setConfirmDeleteId(product._id)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OutOfStockManager;
