import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchProducts } from "../../features/product/product-slice";
import style from "./Products.module.scss";
import { useRef } from "react";

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

function buildProductImageUrl(publicId) {
  if (!cloudName || !publicId) {
    return "";
  }

  const safePublicId = publicId
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `https://res.cloudinary.com/${cloudName}/image/upload/f_webp,q_auto,w_320,c_fill/${safePublicId}`;
}

function Products() {
  const loaderRef = useRef(null);
  const products = useSelector((state) => state.product.products);
  const { hasMore } = useSelector((state) => state.product);
  const dispatch = useDispatch();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];

        if (firstEntry.isIntersecting && hasMore) {
          dispatch(fetchProducts());
        }
      },
      { threshold: 0.5 },
    );

    const currentRef = loaderRef.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [dispatch, hasMore]);

  return (
    <section className={style.SectionProducts}>
      <h1>all products will be here</h1>
      <div className={style.cardContainer}>
        {products.map((product) => (
          <div className={style.productCard} key={product._id}>
            <div className={style.productImage}>
              {product.imagePublicId ? (
                <img
                  src={buildProductImageUrl(product.imagePublicId)}
                  alt={product.title}
                  width="320"
                  height="280"
                />
              ) : null}
            </div>

            <div className={style.productInfo}>
              <h2>{product.title || product.name}</h2>
              <p>{product.description}</p>
            </div>
          </div>
        ))}
        <div ref={loaderRef} className={style.loader}></div>
      </div>
    </section>
  );
}

export default Products;
