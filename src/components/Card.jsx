const Card = ({ image, title, price, description }) => {
  const clickHere = () => {
    console.log("Button clicked");
  };
  return (
    <>
      <div
        className="card mb-3 my-auto mx-auto"
        onClick={clickHere}
        style={{ maxWidth: "800px" }}
      >
        <div className="row g-0">
          {image && (
            <div className="col-md-4">
              <img
                src={image}
                className="img-fluid h-100 rounded-start"
                alt={title}
                style={{ objectFit: "cover" }}
              />
            </div>
          )}

          <div className={image ? "col-md-8" : "col-12"}>
            <div className="card-body">
              <h5 className="card-title">{title}</h5>
              <p className="card-text mb-1">
                <strong>Salary:</strong> ₹{price}
              </p>
              <p className="card-text text-muted">{description}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Card;
