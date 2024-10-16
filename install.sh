(
    cd agregcine_frontend;
    npm install;
    npm run build;
)
(
    cd agregcine_backend;
    cargo build --release;
)
rm -rf agregcine_backend/static
cp -r agregcine_frontend/dist/ agregcine_backend/static
