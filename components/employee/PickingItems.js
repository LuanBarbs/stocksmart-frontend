import React, { useState, useEffect } from "react";
import { FaEye, FaBars, FaPlusSquare, FaTrash, FaEdit, FaBox, FaWarehouse } from "react-icons/fa";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "../../styles/InitManager.module.css";
import Item from "../../models/Item";
import ItemController from "../../controller/ItemController";
import Warehouse from "../../models/Warehouse";


export default function PickingItems() {

    const [showItems, setShowItems] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectItemModalOpen, setShowselectItemModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const [selectDestinyModalOpen, setSelectDestinyModalOpen] = useState(false);
    const [warehouses, setWarehouses] = useState([]);
    const [showWarehousesOrigin, setShowWarehousesOrigin] = useState(true);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
   
    const [showPickingItems, setShowPickingItems] = useState(true);

    const [items, setItems] = useState([]);
    const [allItems, setAllItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);

    const handleToggleItems = () => setShowItems(!showItems);

    const handleToggleWarehousesOrigin = () => setShowWarehousesOrigin(!showWarehousesOrigin);

    const handleOpenItemModal = (item) => {
        setSelectedItem(item);
        setShowModal(true);
    };
    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleSelectWarehouse = (warehouse) => {
        setShowWarehousesOrigin(false);     ;
        const warehouseItens = allItems.filter(item => Number(item.warehouseId) === warehouse.id);
        setItems(warehouseItens);
        setShowPickingItems(false)
        setShowItems(true)
        setShowPickingItems(true)
    };

    const handleSelectItem = (item) => {
        // Evita itens duplicados
        if (!selectedItems.some((selected) => selected.id === item.id)) {
            setSelectedItems([...selectedItems, item]);
        }
        setEditItem(item);
        setSelectDestinyModalOpen(true);
    };
    const handleAddSelectedItems = (item) => {        
        setEditItem(item);
        setSelectDestinyModalOpen(true);
    };

    const handleEndListSelectedItems = () =>{
        for (const item of selectedItems) {
            ItemController.deleteItem(item.id);
        }
        setSelectedItems([]); // Define a lista como vazia
        setShowItems(false);
        setShowWarehousesOrigin(true);
    }

    const handleUpdateItem = async () => {
        if (editItem.quantity <= 0 || !editItem.name || !editItem.warehouseId || !editItem.category || !editItem.volume || !editItem.expirationDate) {
            alert("Erro: Todos os campos devem ser preenchidos corretamente.");
            return;
        }

        const updatedItems = items.map(item =>
            item.id === editItem.id ? editItem : item
        );
        setItems(updatedItems);
        await AsyncStorage.setItem('items', JSON.stringify(updatedItems));
        setSelectDestinyModalOpen(false);
        handleCloseModal();
        alert("Movimentação realizada com sucesso!");
    };

    const backSelectWarehouse = () => {
        setShowItems(false)
        setShowWarehousesOrigin(true)
    };

    const handleOpenWarehouseModal = (warehouse) => {
        const newSelectedWarehouse = new Warehouse(
            warehouse.id,
            warehouse.name,
            warehouse.location,
            warehouse.capacity,
            warehouse.currentCapacity,
            warehouse.zones,
            warehouse.status,
            warehouse.createdAt,
        );

        setSelectedWarehouse(newSelectedWarehouse);
        setShowModal(true);
    };

    // Carregar depósitos do AsyncStorage ao iniciar.
    useEffect(() => {
        const loadData = async () => {
            try {
                const storedWarehouses = await AsyncStorage.getItem('warehouses');
                setWarehouses(storedWarehouses ? JSON.parse(storedWarehouses) : []);
            } catch (error) {
                console.error("Erro ao carregar dados do AsyncStorage: ", error);
            }
        };

        loadData();
    }, []);

    // Caregar itens ao iniciar.
    const loadItems = async () => {
        const storedItems = await ItemController.listItems();
        setAllItems(storedItems);
    };
    useEffect(() => {
        loadItems();
    }, []);

    return (
        <main className={styles.wContainer}>
            
            <section className={styles.content}>

            {showPickingItems && (
                    <section className={`${showPickingItems ? styles.formContainer : styles.fullFormContainer}`}>
                            <h1>Itens Selecionados</h1>
                            <button className={styles.selectButton} onClick={handleEndListSelectedItems}>
                                Finalizar
                            </button>
                        <hr color="#f1f1b1" size="5"/>
                        <ul>
                            {selectedItems.length != 0 && (
                                selectedItems.map((item, index) => (
                                    <li key={index} className={styles.warehouseBox}>
                                        <span>{item.id} - Nome: {item.name}</span>
                                        <button
                                            className={styles.eyeButton}
                                            onClick={() => handleOpenItemModal(item)}
                                        >
                                            <FaEye />
                                        </button>
                                        <button
                                            className={styles.selectButton}
                                            onClick={() => handleSelectWarehouse(item)}    >
                                            Selecionar
                                        </button>
                                    </li>
                                ))
                            )}
                            {warehouses.length == 0 && (
                                <p>Não há itens selecionados!</p>
                            )}
                        </ul>
                    </section>
                )}
                
                {showWarehousesOrigin && (
                    <section className={`${showWarehousesOrigin ? styles.formContainer : styles.fullFormContainer}`}>
                        <h1>Armazém de origem</h1>
                        <hr color="#f1f1b1" size="5"/>
                        <ul>
                            {warehouses.length != 0 && (
                                warehouses.map((warehouse, index) => (
                                    <li key={index} className={styles.warehouseBox}>
                                        <span>{warehouse.id} - Nome: {warehouse.name}</span>
                                        <button
                                            className={styles.eyeButton}
                                            onClick={() => handleOpenWarehouseModal(warehouse)}
                                        >
                                            <FaEye />
                                        </button>
                                        <button
                                            className={styles.selectButton}
                                            onClick={() => handleSelectWarehouse(warehouse)}    >
                                            Selecionar
                                        </button>
                                    </li>
                                ))
                            )}
                            {warehouses.length == 0 && (
                                <p>Não há armazéns cadastrados!</p>
                            )}
                        </ul>
                    </section>
                )}
                
                {showModal && selectedWarehouse && (
                    <section className={styles.modal}>
                        <div className={styles.modalContent}>
                            <button className={styles.closeButton} onClick={handleCloseModal}>X</button>
                            <FaWarehouse size={100}/>
                            <h2>{selectedWarehouse?.name}</h2>
                            <p>Endereço: {selectedWarehouse?.location}</p>
                            <p>Capacidade Total (em m^3): {selectedWarehouse?.capacity}</p>
                            <p>Capacidade Disponível (em m^3): {selectedWarehouse?.getAvailableCapacity()}</p>
                            <p>Quantidade de zonas: {selectedWarehouse?.zones.length}</p>
                            <p>Status: {selectedWarehouse?.status === "active" ? "Ativo" : "Inativo"}</p>                        
                        </div>
                    </section>
                )}     
                
                {showItems && (        
                    <section className={`${showItems ? styles.warehousesContainer : styles.fullWarehousesContainer}`}>
                        <button className={styles.backButton} onClick={() => backSelectWarehouse()}>
                            ← Voltar
                        </button>
                        <h1>Itens Cadastrados</h1>
                        <hr color="#f1f1b1" size="5"/>
                        <ul>
                            {items.length != 0 && (
                                items.map((item, index) => (
                                    <li key={index} className={styles.warehouseBox}>
                                        <span>{item.id} - {item.name}</span>
                                        <button
                                            className={styles.eyeButton}
                                            onClick={() => handleOpenItemModal(item)}
                                        >
                                            <FaEye />
                                        </button>
                                        <button
                                            className={styles.selectButton}
                                            onClick={() => handleSelectItem(item)}    >
                                            Selecionar
                                        </button>
                                    </li>
                                ))
                            )}
                            {items.length == 0 && (
                                <p>Não há itens cadastrados!</p>
                            )}
                        </ul>
                    </section>
                )}
            </section>
            
            {/* Modal de Visualização do Item */}
            {showModal && selectedItem && (
                <section className={styles.modal}>
                    <div className={styles.modalContent}>
                        <button className={styles.closeButton} onClick={handleCloseModal}>X</button>
                        <FaBox size={100}/>
                        <h2>{selectedItem?.name}</h2>
                        <p>Quantidade: {selectedItem?.quantity}</p>
                        <p>Id do depósito: {selectedItem?.warehouseId}</p>
                        <p>Categoria: {selectedItem?.category}</p>
                        <p>Volume (unitário): {selectedItem?.volume}</p>
                        <p>Data de validade: {selectedItem?.expirationDate}</p>
                        <p>Status: {selectedItem?.status === "active" ? "Ativo" : "Inativo"}</p>
                        
                    </div>
                </section>
            )}          

        </main>
    );
};