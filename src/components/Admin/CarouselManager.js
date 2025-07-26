import React, { useEffect, useState, useCallback } from 'react';

export default function CarouselManager() {
    const API = process.env.REACT_APP_API_BASE;
    const [images, setImages] = useState([]);
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [visible, setVisible] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectingImage, setSelectingImage] = useState(false);

    const fetchImages = useCallback(async () => {
        try {
            const res = await fetch(`${API}/carousel/getCarouselImages.php`);
            const data = await res.json();
            setImages(data);
        } catch (error) {
            console.error('Failed to fetch images:', error);
            setStatus('Failed to fetch images');
        }
    }, [API]);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setStatus('Please select a file to upload.');
            return;
        }

        setLoading(true);
        setUploadProgress(0);
        const formData = new FormData();
        formData.append('image', file);
        formData.append('title', title);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API}/carousel/uploadCarouselImage.php`, true);

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                setUploadProgress(percent);
            }
        };

        xhr.onload = () => {
            setLoading(false);
            setUploadProgress(0);
            if (xhr.status === 200) {
                setStatus('Image uploaded successfully!');
                setFile(null);
                setTitle('');
                fetchImages();
            } else {
                setStatus('Upload failed. Please try again.');
            }
        };

        xhr.onerror = () => {
            setLoading(false);
            setUploadProgress(0);
            setStatus('Error uploading image');
        };

        xhr.send(formData);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this image?')) return;

        try {
            await fetch(`${API}/carousel/deleteCarouselImage.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            fetchImages();
        } catch (error) {
            console.error('Delete error:', error);
            setStatus('Failed to delete image');
        }
    };

    return (
        <div className="mb-10">
            <button
                onClick={() => setVisible(!visible)}
                className="mb-4 bg-[#295A12] hover:bg-[#398908] text-white font-medium px-6 py-2.5 rounded transition w-full sm:w-auto"
            >
                {visible ? 'Hide Carousel Manager' : 'Show Carousel Manager'}
            </button>

            {visible && (
                <>
                    <form
                        onSubmit={handleUpload}
                        className="flex flex-col md:flex-row items-stretch gap-3 mb-6"
                    >
                        <div className="flex flex-col gap-1 w-full md:w-1/3">
                            <label className="text-sm font-medium text-gray-700">Select Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const selectedFile = e.target.files[0];
                                    if (selectedFile) {
                                        setSelectingImage(true);
                                        setTimeout(() => {
                                            setFile(selectedFile);
                                            setSelectingImage(false);
                                        }, 400);
                                    }
                                }}
                                className="border rounded px-3 py-2 text-sm"
                            />
                            {selectingImage && (
                                <div className="mt-1 text-sm text-gray-500 flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-green-600" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10"
                                            stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Processing image…
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-1 w-full md:flex-1">
                            <label className="text-sm font-medium text-gray-700">Image Title (optional)</label>
                            <input
                                type="text"
                                placeholder="e.g., Welcome Banner"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="border rounded px-3 py-2 text-sm"
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={loading || selectingImage}
                                className="bg-[#295A12] hover:bg-[#398908] text-white font-medium px-6 py-2.5 rounded transition disabled:opacity-50"
                            >
                                {loading ? 'Uploading…' : 'Upload'}
                            </button>
                        </div>
                    </form>

                    {loading && (
                        <div className="w-full h-2 bg-gray-200 rounded overflow-hidden mb-4">
                            <div
                                className="h-full bg-green-500 transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    )}

                    {status && (
                        <div className="text-sm text-gray-700 mb-4">{status}</div>
                    )}

                    <div className="overflow-x-auto">
                        <div className="flex gap-4 pb-2">
                            {images.map((img) => (
                                <div
                                    key={img.id}
                                    className="relative w-48 h-28 flex-shrink-0 border rounded-lg shadow hover:shadow-md overflow-hidden"
                                >
                                    <img
                                        src={`/assets/carousel/${img.filename}`}
                                        alt={img.title || `Image ${img.id}`}
                                        className="w-full h-full object-cover"
                                    />
                                    {img.title && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-40 text-white text-xs p-1 text-center truncate">
                                            {img.title}
                                        </div>
                                    )}
                                    <button
                                        onClick={() => handleDelete(img.id)}
                                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded-full"
                                        title="Delete"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
