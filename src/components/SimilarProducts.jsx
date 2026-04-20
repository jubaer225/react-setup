import { useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { buildImageUrl } from "../utils/cloudnary";
import style from "./SimilarProducts.module.scss";

function getImageSrc(product) {
  const firstImage = Array.isArray(product?.images) ? product.images[0] : null;

  if (!firstImage && typeof product?.image === "string") {
    return product.image.startsWith("http")
      ? product.image
      : buildImageUrl(product.image, {
          width: 800,
          height: 800,
          crop: "fill",
        });
  }

  if (!firstImage && product?.image && typeof product.image === "object") {
    const publicId = product.image.public_id || product.image.publicId;
    return (
      product.image.url ||
      (publicId
        ? buildImageUrl(publicId, {
            width: 800,
            height: 800,
            crop: "fill",
          })
        : "")
    );
  }

  if (!firstImage) return "";

  if (typeof firstImage === "string") {
    return firstImage.startsWith("http")
      ? firstImage
      : buildImageUrl(firstImage, {
          width: 800,
          height: 800,
          crop: "fill",
        });
  }

  const publicId = firstImage.public_id || firstImage.publicId;
  return (
    firstImage.url ||
    (publicId
      ? buildImageUrl(publicId, {
          width: 800,
          height: 800,
          crop: "fill",
        })
      : "")
  );
}

function SimilarProducts({
  items = [],
  loading = false,
  error = null,
  currentProductId,
}) {
  const navigate = useNavigate();
  const sliderRef = useRef(null);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const itemId = item?._id || item?.id;
      return itemId && itemId !== currentProductId;
    });
  }, [items, currentProductId]);

  const handleScroll = (direction) => {
    const slider = sliderRef.current;
    if (!slider) return;

    const amount = direction === "left" ? -340 : 340;
    slider.scrollBy({
      left: amount,
      behavior: "smooth",
    });
  };

  return (
    <section className={style.section}>
      <div className={style.headerRow}>
        <h2 className={style.title}>Similar Products</h2>
        <div className={style.controlRow}>
          <button
            type="button"
            onClick={() => handleScroll("left")}
            className={style.scrollButton}
            aria-label="Scroll similar products left"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => handleScroll("right")}
            className={style.scrollButton}
            aria-label="Scroll similar products right"
          >
            Next
          </button>
        </div>
      </div>

      {loading && (
        <div className={style.slider}>
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              className={style.skeletonCard}
              key={`similar-skeleton-${index}`}
            >
              <div className={style.skeletonImage} />
              <div className={style.skeletonTitle} />
              <div className={style.skeletonPrice} />
            </div>
          ))}
        </div>
      )}

      {!loading && error && <p className={style.message}>{error}</p>}

      {!loading && !error && filteredItems.length === 0 && (
        <p className={style.message}>No similar products found.</p>
      )}

      {!loading && !error && filteredItems.length > 0 && (
        <div className={style.slider} ref={sliderRef}>
          {filteredItems.map((item) => {
            const productId = item._id || item.id;
            const imageSrc = getImageSrc(item);

            return (
              <article
                key={productId}
                className={style.card}
                onClick={() => navigate(`/products/${productId}`)}
              >
                <div className={style.imageWrap}>
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={item.title || item.name || "Similar product"}
                      loading="lazy"
                      className={style.image}
                    />
                  ) : (
                    <div className={style.imageFallback}>No image</div>
                  )}
                </div>
                <div className={style.cardBody}>
                  <h3 className={style.cardTitle}>
                    {item.title || item.name || "Untitled Product"}
                  </h3>
                  <p className={style.cardPrice}>
                    ${Number(item.price || 0).toFixed(2)}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default SimilarProducts;
