-- ShopGuard AI — SQL Server Stored Procedures
-- Run against ShopGuardDB after schema migration

-- sp_GetOrderSummary: aggregate order stats for admin dashboard
CREATE OR ALTER PROCEDURE sp_GetOrderSummary
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        COUNT(*) AS total_orders,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed_orders,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_orders,
        ISNULL(SUM(total_amount), 0) AS total_revenue
    FROM orders;
END;
GO

-- sp_ProcessCheckout: transactional checkout with stock validation
CREATE OR ALTER PROCEDURE sp_ProcessCheckout
    @UserId INT,
    @ProductId INT,
    @Quantity INT,
    @OrderId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    BEGIN TRY
        DECLARE @Stock INT, @Price FLOAT;

        SELECT @Stock = stock, @Price = price
        FROM products WITH (UPDLOCK, ROWLOCK)
        WHERE id = @ProductId AND is_active = 1;

        IF @Stock IS NULL
            THROW 50001, 'Product not found', 1;

        IF @Stock < @Quantity
            THROW 50002, 'Insufficient stock', 1;

        UPDATE products SET stock = stock - @Quantity WHERE id = @ProductId;

        INSERT INTO orders (user_id, status, total_amount, created_at)
        VALUES (@UserId, 'confirmed', @Price * @Quantity, GETUTCDATE());

        SET @OrderId = SCOPE_IDENTITY();

        INSERT INTO order_items (order_id, product_id, quantity, unit_price)
        VALUES (@OrderId, @ProductId, @Quantity, @Price);

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- sp_GetLowStockProducts: inventory alert for admin
CREATE OR ALTER PROCEDURE sp_GetLowStockProducts
    @Threshold INT = 10
AS
BEGIN
    SET NOCOUNT ON;

    SELECT id, name, stock, category
    FROM products
    WHERE is_active = 1 AND stock <= @Threshold
    ORDER BY stock ASC;
END;
GO

-- sp_GetTestRunStats: flaky test detection metrics
CREATE OR ALTER PROCEDURE sp_GetTestRunStats
    @DaysBack INT = 30
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        pipeline_id,
        COUNT(*) AS total_runs,
        AVG(CAST(passed AS FLOAT) / NULLIF(total_tests, 0)) AS avg_pass_rate,
        AVG(flaky_score) AS avg_flaky_score,
        MAX(created_at) AS last_run
    FROM test_runs
    WHERE created_at >= DATEADD(DAY, -@DaysBack, GETUTCDATE())
    GROUP BY pipeline_id
    ORDER BY avg_flaky_score DESC;
END;
GO
