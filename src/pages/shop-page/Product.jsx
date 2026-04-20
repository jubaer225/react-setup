import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  featchProductById,
  fetchSimilarProducts,
} from "../../features/product/product-slice";
import { addToCart } from "../../features/product/cart-slice";
import { openCart } from "../../features/product/cart-slice";
import { buildImageUrl } from "../../utils/cloudnary";
import SimilarProducts from "../../components/SimilarProducts";
import style from "./Product.module.scss";

function ProductGallery({ images, title }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className={style.galleryEmpty}>
        <p>No product images available.</p>
      </div>
    );
  }

  const activeImage = images[activeImageIndex] || images[0];

  const goToPrevious = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className={style.gallerySection}>
      <div className={style.mainImageWrap}>
        <img
          key={`main-image-${activeImageIndex}`}
          className={style.mainImage}
          src={activeImage.src}
          alt={`${title} ${activeImageIndex + 1}`}
          loading="lazy"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              className={`${style.carouselButton} ${style.carouselPrev}`}
              onClick={goToPrevious}
              aria-label="Show previous image"
            >
              Previous
            </button>
            <button
              type="button"
              className={`${style.carouselButton} ${style.carouselNext}`}
              onClick={goToNext}
              aria-label="Show next image"
            >
              Next
            </button>
          </>
        )}
      </div>

      <div className={style.thumbnailRow}>
        {images.map((image, index) => {
          const isActive = index === activeImageIndex;
          return (
            <button
              type="button"
              key={image.id}
              onClick={() => setActiveImageIndex(index)}
              className={`${style.thumbnailButton} ${isActive ? style.thumbnailActive : ""}`}
              aria-label={`Show image ${index + 1}`}
            >
              <img
                src={image.src}
                alt={`${title} thumbnail ${index + 1}`}
                loading="lazy"
                className={style.thumbnailImage}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ProductInfo({ product }) {
  const [quantity, setQuantity] = useState(1);
  const dispatch = useDispatch();

  const handleAddToCart = async () => {
    try {
      await dispatch(
        addToCart({ productId: product._id || product.id, quantity }),
      ).unwrap();
      dispatch(openCart());
    } catch {
      // The slice already captures the error; keep the drawer closed on failure.
    }
  };

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  return (
    <div className={style.infoSection}>
      <h1 className={style.title}>
        {product.title || product.name || "Untitled Product"}
      </h1>
      <p className={style.price}>${Number(product.price || 0).toFixed(2)}</p>
      <p className={style.description}>
        {product.description || "No description available for this product."}
      </p>

      <div className={style.quantityBlock}>
        <span className={style.quantityLabel}>Quantity</span>
        <div className={style.quantityControl}>
          <button
            type="button"
            onClick={decreaseQuantity}
            className={style.quantityButton}
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className={style.quantityValue}>{quantity}</span>
          <button
            type="button"
            onClick={increaseQuantity}
            className={style.quantityButton}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <div className={style.actionRow}>
        <button type="button" className={style.addToCartButton} onClick={handleAddToCart}>
          Add to Cart
        </button>
        <button type="button" className={style.wishlistButton}>
          Add to Wishlist
        </button>
      </div>
    </div>
  );
}

function Product() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const product = useSelector((state) => state.product.singleProduct);
  const similarProducts = useSelector((state) => state.product.similarProducts);

  useEffect(() => {
    dispatch(featchProductById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (!product?.category) return;
    dispatch(fetchSimilarProducts(product.category));
  }, [dispatch, product?.category]);

  const images = useMemo(() => {
    const normalizedImages = Array.isArray(product?.images)
      ? product.images
      : product?.image
        ? [product.image]
        : [];

    return normalizedImages
      .map((image, index) => {
        if (!image) return null;

        if (typeof image === "string") {
          const src = image.startsWith("http")
            ? image
            : buildImageUrl(image, {
                width: 1200,
                height: 1200,
                crop: "fill",
              });

          return src
            ? {
                id: `product-image-${index}`,
                src,
              }
            : null;
        }

        const publicId = image.public_id || image.publicId;
        const src =
          image.url ||
          (publicId
            ? buildImageUrl(publicId, {
                width: 1200,
                height: 1200,
                crop: "fill",
              })
            : "");

        if (!src) return null;

        return {
          id:
            image.public_id ||
            image.publicId ||
            image.url ||
            `product-image-${index}`,
          src,
        };
      })
      .filter(Boolean);
  }, [product]);

  if (!product) {
    return (
      <section className={style.page}>
        <div className={style.loadingCard}>Loading product details...</div>
      </section>
    );
  }

  return (
    <section className={style.page}>
      <div className={style.card}>
        <ProductGallery
          key={product._id || product.id || "product-gallery"}
          images={images}
          title={product.title || product.name || "Product"}
        />
        <ProductInfo product={product} />
      </div>

      <SimilarProducts
        items={similarProducts.items}
        loading={similarProducts.loading}
        error={similarProducts.error}
        currentProductId={product._id || product.id}
      />
    </section>
  );
}

export default Product;
