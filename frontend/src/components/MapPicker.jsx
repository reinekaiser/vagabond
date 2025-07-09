import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const customIcon = new L.Icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconAnchor: [12, 41]
});

const MapPicker = ({ form, validationRules = {} }) => {
    const [location, setLocation] = useState(() => {
        const lat = parseFloat(form.watch("lat")) || 21.0285;
        const lng = parseFloat(form.watch("lng")) || 105.8542;
        return { lat, lng };
    });

    const handleSearchAddress = async (e) => {
        e.preventDefault();

        const address = form.getValues("address");
        if (!address.trim()) return;
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.length > 0) {
                const { lat, lon } = data[0];
                setLocation({ lat: parseFloat(lat), lng: parseFloat(lon) });
                form.setValue("lat", parseFloat(lat));
                form.setValue("lng", parseFloat(lon));
            } else {
                alert("Không tìm thấy địa chỉ!");
            }
        } catch (error) {
            console.error("Lỗi tìm kiếm địa chỉ:", error);
        }
    };

    const MapEventsAndCenterUpdater = () => {
        const map = useMap();
        useMapEvents({
            click: (e) => {
                const lat = e.latlng.lat;
                const lng = e.latlng.lng;
                setLocation({ lat, lng });
                form.setValue("lat", lat); // Cập nhật lat trong form
                form.setValue("lng", lng); // Cập nhật lng trong form
            }
        });

        map.flyTo([location.lat, location.lng], map.getZoom());
        return null;
    };

    return (
        <div>
            <div className="mb-3">
                <label className='font-medium'>
                    Địa chỉ
                    {validationRules.required && (
                        <span className="text-red-500">*</span>
                    )}
                </label>
                <div className='flex'>
                    <input
                        type="text"
                        placeholder="Nhập địa chỉ..."
                        {...form.register("address", validationRules)}
                        className={`flex-1 mr-4 border p-2 rounded ${
                            form.errors['address'] ? "border-red-500" : "border-gray-300"
                        }`}
                    />
                    <button onClick={handleSearchAddress} className="p-2 bg-blue-500 text-white rounded">
                        Tìm kiếm
                    </button>
                </div>
                {form.errors['address'] && (
                    <p className="text-red-500 text-sm mt-1">{form.errors['address']?.message}</p>
                )}
            </div>

            <div className="">
                <label className='font-medium'>Vị trí</label>
                <MapContainer center={location} zoom={15} style={{ height: "250px", width: "100%", borderRadius: "8px" }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                    />
                    <MapEventsAndCenterUpdater />
                    <Marker position={location} icon={customIcon}>
                        <Popup>
                            <span>Vị trí khách sạn: {location.lat}, {location.lng}</span>
                        </Popup>
                    </Marker>
                </MapContainer>

                <div className="flex my-2">
                    <div className="">
                        <label className='font-medium mr-2'>Vĩ độ</label>
                        <input
                            type="number"
                            placeholder="Vĩ độ"
                            {...form.register("lat")}
                            className='border p-[6px] rounded'
                        />
                    </div>
                    <div className="ml-4">
                        <label className='font-medium mr-2'>Kinh độ</label>
                        <input
                            type="number"
                            placeholder="Kinh độ"
                            {...form.register("lng")}
                            className='border p-[6px] rounded'
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapPicker;