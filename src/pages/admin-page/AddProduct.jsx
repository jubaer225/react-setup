import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createProduct } from "../../features/product/product-slice";
import styles from "./AddProduct.module.scss";

function AddProduct() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.product);
  const fileInputRef = useRef(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    brand: "",
    stock: "",
  });

  useEffect(() => {
    return () => {
      images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, [images]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFiles = (fileList) => {
    const validFiles = Array.from(fileList).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (validFiles.length === 0) {
      return;
    }

    const newImages = validFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  const handleChooseFiles = (event) => {
    handleFiles(event.target.files);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  const handleRemoveImage = (imageId) => {
    setImages((prev) => {
      const imageToRemove = prev.find((image) => image.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }
      return prev.filter((image) => image.id !== imageId);
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage("");

    const payload = new FormData();
    payload.append("title", formData.title);
    payload.append("description", formData.description);
    payload.append("price", String(Number(formData.price)));
    payload.append("category", formData.category);
    payload.append("brand", formData.brand);
    payload.append("stock", String(Number(formData.stock)));

    images.forEach((image) => {
      payload.append("images", image.file);
    });

    const resultAction = await dispatch(createProduct(payload));

    if (createProduct.fulfilled.match(resultAction)) {
      setSuccessMessage("Product created successfully.");
      setFormData({
        title: "",
        description: "",
        price: "",
        category: "",
        brand: "",
        stock: "",
      });
      images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      setImages([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.title}>Add Product</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div
          className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            className={styles.fileInput}
            type="file"
            accept="image/*"
            multiple
            onChange={handleChooseFiles}
          />

          <p className={styles.dropTitle}>Product Images</p>
          <p className={styles.dropHint}>Drag and drop images here</p>
          <button
            type="button"
            className={styles.pickButton}
            onClick={() => fileInputRef.current?.click()}
          >
            Choose files
          </button>
        </div>

        {images.length > 0 && (
          <div className={styles.previewGrid}>
            {images.map((image) => (
              <div className={styles.previewCard} key={image.id}>
                <img
                  src={image.previewUrl}
                  alt={image.file.name}
                  className={styles.previewImage}
                />
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => handleRemoveImage(image.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          className={styles.field}
          type="text"
          name="title"
          placeholder="Product title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <input
          className={styles.field}
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          min="0"
          step="0.01"
          required
        />

        <textarea
          className={styles.field}
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          required
        />

        <input
          className={styles.field}
          type="text"
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={handleChange}
        />

        <input
          className={styles.field}
          type="text"
          name="brand"
          placeholder="Brand"
          value={formData.brand}
          onChange={handleChange}
        />

        <input
          className={styles.field}
          type="number"
          name="stock"
          placeholder="Stock"
          value={formData.stock}
          onChange={handleChange}
          min="0"
        />

        <button
          className={styles.submitButton}
          type="submit"
          disabled={loading}
        >
          {loading ? "Saving..." : "Create Product"}
        </button>
      </form>

      {error && <p className={styles.error}>{error}</p>}
      {successMessage && <p className={styles.success}>{successMessage}</p>}
    </section>
  );
}

export default AddProduct;
