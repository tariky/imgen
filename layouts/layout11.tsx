// Layout for 1:1 aspect ratio (square layout)
export function createLayout11(
  productImgBase64: string,
  brandName: string,
  productName: string,
  finalPrice: string | null,
  oldPrice: string | null,
  isDiscounted: boolean,
  discountPercentage: number | null,
  debugMode: boolean = false
) {
  const debugBorder = debugMode ? "2px solid red" : "none";

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        flexDirection: "row",
        fontFamily: "Zalando Sans",
        border: debugBorder,
      }}
    >
      {/* LEFT COLUMN: PRODUCT IMAGE */}
      <div
        style={{
          display: "flex",
          flex: "0 0 60%",
          height: "100%",
          paddingRight: "0px",
          alignItems: "center",
          justifyContent: "center",
          border: debugMode ? "2px solid blue" : "none",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            border: "1px solid #e0e0e0",
            overflow: "hidden",
          }}
        >
          <img
            src={productImgBase64}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        </div>
      </div>

      {/* RIGHT COLUMN: INFO & TEXT */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: "0 0 40%",
          height: "100%",
          paddingTop: "240px",
          paddingBottom: "240px",
          justifyContent: "space-between",
          alignItems: "center",
          border: debugMode ? "2px solid green" : "none",
          boxSizing: "border-box",
        }}
      >
        {/* TOP: Special Offer Label */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isDiscounted && discountPercentage ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "red",
                color: "white",
                fontSize: "26px",
                fontWeight: 700,
                height: "200px",
                width: "200px",
                borderRadius: "50%",
                lineHeight: "1.2",
                textAlign: "center",
              }}
            >
              <span>Sniženo</span>
              <span style={{ fontSize: "32px" }}>-{discountPercentage}%</span>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-rosette-discount-check"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12.01 2.011a3.2 3.2 0 0 1 2.113 .797l.154 .145l.698 .698a1.2 1.2 0 0 0 .71 .341l.135 .008h1a3.2 3.2 0 0 1 3.195 3.018l.005 .182v1c0 .27 .092 .533 .258 .743l.09 .1l.697 .698a3.2 3.2 0 0 1 .147 4.382l-.145 .154l-.698 .698a1.2 1.2 0 0 0 -.341 .71l-.008 .135v1a3.2 3.2 0 0 1 -3.018 3.195l-.182 .005h-1a1.2 1.2 0 0 0 -.743 .258l-.1 .09l-.698 .697a3.2 3.2 0 0 1 -4.382 .147l-.154 -.145l-.698 -.698a1.2 1.2 0 0 0 -.71 -.341l-.135 -.008h-1a3.2 3.2 0 0 1 -3.195 -3.018l-.005 -.182v-1a1.2 1.2 0 0 0 -.258 -.743l-.09 -.1l-.697 -.698a3.2 3.2 0 0 1 -.147 -4.382l.145 -.154l.698 -.698a1.2 1.2 0 0 0 .341 -.71l.008 -.135v-1l.005 -.182a3.2 3.2 0 0 1 3.013 -3.013l.182 -.005h1a1.2 1.2 0 0 0 .743 -.258l.1 -.09l.698 -.697a3.2 3.2 0 0 1 2.269 -.944zm3.697 7.282a1 1 0 0 0 -1.414 0l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.32 1.497l2 2l.094 .083a1 1 0 0 0 1.32 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z" /></svg>
              <span style={{ fontSize: "28px" }}>Plaćanje pouzećem</span>
            </div>
          )}
        </div>

        {/* MIDDLE: Brand Name */}
        <div
          style={{
            display: "flex",
            fontSize: "72px",
            fontWeight: 700,
            color: "black",
            letterSpacing: "-2px",
            textAlign: "center",
            justifyContent: "center",
            border: debugMode ? "1px solid orange" : "none",
          }}
        >
          {brandName}
        </div>

        {/* BOTTOM: Pricing Block */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            border: debugMode ? "1px solid purple" : "none",
          }}
        >
          {/* Old Price */}
          {isDiscounted && (
            <div
              style={{
                display: "flex",
                fontSize: "36px",
                color: "#666",
                textDecoration: "line-through",
                marginBottom: "10px",
                justifyContent: "center",
              }}
            >
              {oldPrice}
            </div>
          )}

          {/* Product Name */}
          <div
            style={{
              display: "flex",
              fontSize: "26px",
              color: "#333",
              marginBottom: "10px",
              justifyContent: "center",
              textAlign: "center",
              paddingLeft: "20px",
              paddingRight: "20px",
            }}
          >
            {productName}
          </div>

          {/* Main Price */}
          <div
            style={{
              display: "flex",
              fontSize: "56px",
              fontWeight: 700,
              color: "black",
              justifyContent: "center",
            }}
          >
            {finalPrice}
          </div>
        </div>
      </div>
    </div>
  );
}

