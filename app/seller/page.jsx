"use client";

import React, { useState, useEffect, useRef } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";

const AddProduct = () => {
  const { getToken } = useAppContext();

  const [files, setFiles] = useState([null, null, null, null]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Earphone");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [stock, setStock] = useState("");
  const [loading, setLoading] = useState(false);
  const [specGroups, setSpecGroups] = useState([
    {
      title: "Main Feature",
      specs: [{ key: "", value: "" }],
    },
  ]);

  const fileInputRefs = useRef([]);

  const resetForm = () => {
    setFiles([null, null, null, null]);
    fileInputRefs.current.forEach((input) => {
      if (input) input.value = "";
    });
    setName("");
    setDescription("");
    setCategory("Earphone");
    setPrice("");
    setOfferPrice("");
    setStock("");
    setSpecGroups([{ title: "Main Feature", specs: [{ key: "", value: "" }] }]);
  };

  const handleGroupTitleChange = (index, value) => {
    const updated = [...specGroups];
    updated[index].title = value;
    setSpecGroups(updated);
  };

  const handleSpecChange = (groupIndex, specIndex, field, value) => {
    const updated = [...specGroups];
    updated[groupIndex].specs[specIndex][field] = value;
    setSpecGroups(updated);
  };

  const addSpecField = (groupIndex) => {
    const updated = [...specGroups];
    updated[groupIndex].specs.push({ key: "", value: "" });
    setSpecGroups(updated);
  };

  const removeSpecField = (groupIndex, specIndex) => {
    const updated = [...specGroups];
    if (updated[groupIndex].specs.length > 1) {
      updated[groupIndex].specs.splice(specIndex, 1);
      setSpecGroups(updated);
    }
  };

  const addSpecGroup = () => {
    setSpecGroups([
      ...specGroups,
      { title: "", specs: [{ key: "", value: "" }] },
    ]);
  };

  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file) URL.revokeObjectURL(file.preview);
      });
    };
  }, [files]);

  const handleFileChange = (index, file) => {
    const updatedFiles = [...files];
    if (file) {
      file.preview = URL.createObjectURL(file);
      updatedFiles[index] = file;
    } else {
      updatedFiles[index] = null;
    }
    setFiles(updatedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!files.some((f) => f !== null)) {
      toast.error("Please upload at least one image.");
      return;
    }

    if (!price || Number(price) <= 0) {
      toast.error("Please enter a valid product price.");
      return;
    }

    if (offerPrice && Number(offerPrice) >= Number(price)) {
      toast.error("Offer price must be less than original price.");
      return;
    }

    if (stock === "" || Number(stock) < 0) {
      toast.error("Stock must be a non-negative number.");
      return;
    }

    const formattedSpecs = {};
    specGroups.forEach((group) => {
      if (!group.title.trim()) return;
      formattedSpecs[group.title.trim()] = {};
      group.specs.forEach((s) => {
        const key = s.key.trim();
        const value = s.value.trim();
        if (key && value) {
          formattedSpecs[group.title.trim()][key] = value;
        }
      });
    });

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("description", description.trim());
    formData.append("category", category);
    formData.append("price", price);
    formData.append("offerPrice", offerPrice || "");
    formData.append("stock", stock);
    formData.append("specs", JSON.stringify(formattedSpecs));

    files.forEach((file) => {
      if (file) formData.append("images", file);
    });

    try {
      setLoading(true);
      const token = getToken();

      const { data } = await axios.post("/api/product/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        toast.success(data.message || "Product added successfully!");
        resetForm();
      } else {
        toast.error(data.message || "Something went wrong!");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Submission failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      <form onSubmit={handleSubmit} className="md:p-10 p-4 space-y-5 max-w-lg">
        <div>
          <p className="text-base font-medium">Product Image</p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {[0, 1, 2, 3].map((index) => (
              <label key={index} htmlFor={`image${index}`}>
                <input
                  type="file"
                  id={`image${index}`}
                  hidden
                  accept="image/*"
                  ref={(el) => (fileInputRefs.current[index] = el)}
                  onChange={(e) => handleFileChange(index, e.target.files[0])}
                />
                <Image
                  className="max-w-24 cursor-pointer"
                  src={files[index] ? files[index].preview : assets.upload_area}
                  alt="Upload Preview"
                  width={100}
                  height={100}
                  unoptimized
                />
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1 max-w-md">
          <label htmlFor="product-name" className="text-base font-medium">
            Product Name
          </label>
          <input
            id="product-name"
            type="text"
            placeholder="Type here"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            onChange={(e) => setName(e.target.value)}
            value={name}
            required
          />
        </div>

        <div className="flex flex-col gap-1 max-w-md">
          <label
            htmlFor="product-description"
            className="text-base font-medium"
          >
            Product Description
          </label>
          <textarea
            id="product-description"
            rows={4}
            placeholder="Type here"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            required
          ></textarea>
        </div>

        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex flex-col gap-1 w-32">
            <label htmlFor="category" className="text-base font-medium">
              Category
            </label>
            <select
              id="category"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setCategory(e.target.value)}
              value={category}
            >
              <option value="Earphone">Earphone</option>
              <option value="Headphone">Headphone</option>
              <option value="Watch">Watch</option>
              <option value="Smartphone">Smartphone</option>
              <option value="Laptop">Laptop</option>
              <option value="Camera">Camera</option>
              <option value="Mouse">Mouse</option>
              <option value="Tablet">Tablet</option>
              <option value="Keyboard">Keyboard</option>
              <option value="Monitor">Monitor</option>
              <option value="Processor">Processor</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 w-32">
            <label htmlFor="product-price" className="text-base font-medium">
              Product Price
            </label>
            <input
              id="product-price"
              type="number"
              placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setPrice(e.target.value)}
              value={price}
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="flex flex-col gap-1 w-32">
            <label htmlFor="offer-price" className="text-base font-medium">
              Offer Price
            </label>
            <input
              id="offer-price"
              type="number"
              placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setOfferPrice(e.target.value)}
              value={offerPrice}
              min="0"
              step="0.01"
            />
          </div>

          <div className="flex flex-col gap-1 w-32">
            <label htmlFor="stock" className="text-base font-medium">
              Stock
            </label>
            <input
              id="stock"
              type="number"
              min="0"
              placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setStock(e.target.value)}
              value={stock}
              required
            />
          </div>
        </div>

        <div className="space-y-6">
          <p className="text-lg font-semibold">Specifications</p>
          {specGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-3">
              <input
                type="text"
                placeholder="Group Title (e.g. Main Feature)"
                value={group.title}
                onChange={(e) =>
                  handleGroupTitleChange(groupIndex, e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-500/40 rounded"
                required
              />
              {group.specs.map((spec, specIndex) => (
                <div key={specIndex} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Key"
                    value={spec.key}
                    onChange={(e) =>
                      handleSpecChange(
                        groupIndex,
                        specIndex,
                        "key",
                        e.target.value
                      )
                    }
                    className="w-32 px-3 py-2 border border-gray-500/40 rounded"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={spec.value}
                    onChange={(e) =>
                      handleSpecChange(
                        groupIndex,
                        specIndex,
                        "value",
                        e.target.value
                      )
                    }
                    className="w-40 px-3 py-2 border border-gray-500/40 rounded"
                    required
                  />
                  {specIndex > 0 && (
                    <button
                      type="button"
                      onClick={() => removeSpecField(groupIndex, specIndex)}
                      className="text-red-600 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addSpecField(groupIndex)}
                className="text-blue-600 text-sm"
              >
                + Add Field
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSpecGroup}
            className="text-green-600 text-sm"
          >
            + Add Spec Group
          </button>
          <div className="mt-10 border-t pt-6 space-y-2">
            <p className="text-lg font-semibold">Bulk Upload via JSON File</p>
            <input
              type="file"
              accept=".json"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                if (file.type !== "application/json") {
                  toast.error("Please upload a valid .json file.");
                  return;
                }
                const formData = new FormData();
                formData.append("file", file);
                try {
                  setLoading(true);
                  const { data } = await axios.post("/api/upload", formData);
                  if (data.success) {
                    toast.success(data.message || "Bulk upload successful!");
                  } else {
                    toast.error(data.message || "Bulk upload failed!");
                  }
                } catch (err) {
                  toast.error(err.response?.data?.message || "Upload error.");
                } finally {
                  setLoading(false);
                }
              }}
              className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-8 py-2.5 bg-orange-600 text-white font-medium rounded disabled:opacity-50"
        >
          {loading ? "Adding..." : "ADD"}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
