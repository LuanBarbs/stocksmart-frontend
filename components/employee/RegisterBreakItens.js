import React, { useState, useEffect } from "react";
import { FaEye, FaBars, FaPlusSquare, FaTrash, FaEdit, FaWarehouse, FaBox } from "react-icons/fa";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "../../styles/InitManager.module.css";
import Item from "../../models/Item";
import ItemController from "../../controller/ItemController";
import Warehouse from "../../models/Warehouse";
import HistoryController from "../../controller/HistoryController";
import UserController from "../../controller/UserController";

export default function RegisterBreakItems() {

    /*
    Falta fazer:
    diminuir a quantidade de itens do amazém
    dividir itens quebrados ou não
    adicionar descrição aos quebrados
    */

    const [showItems, setShowItems] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectItemModalOpen, setShowselectItemModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [selectDestinyModalOpen, setSelectDestinyModalOpen] = useState(false);
    const [detail, setDetail] = useState("");
    const [quantity, setQuantity] = useState(0);


    const [description, setDescription] = useState(""); // Estado inicial vazio   
    
    const [users, setUsers] = useState([]);

    const [warehouses, setWarehouses] = useState([]);
    const [showWarehousesOrigin, setShowWarehousesOrigin] = useState(true);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
   
    const [items, setItems] = useState([]);
    const [allItems, setAllItems] = useState([]);

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
        setShowWarehousesOrigin(false);   ;
        const warehouseItens = allItems.filter(item => Number(item.warehouseId) === warehouse.id);
        setItems(warehouseItens);
        setShowItems(true)
    };

    const handleSelectItem = (item) => {        
        setEditItem(item);
        setSelectDestinyModalOpen(true);
    };

    const handleUpdateItem = async () => {
        if (editItem.quantity <= 0 || !editItem.name || !editItem.warehouseId || !editItem.category || !editItem.volume || !editItem.expirationDate) {
            alert("Erro: Todos os campos devem ser preenchidos corretamente.");
            return;
        }
        
        //  novo item: igual ao anterior, com a quantidade inserida, status de defeito
        const itemQuebrado = new Item(null, editItem.name, editItem.quantity, editItem.warehouseId, editItem.category, editItem.volume, editItem.expirationDate, editItem.createdAt, "damaged");
        
        const response = await ItemController.createItem(itemQuebrado);
        if (response.error) {
            alert(response.error);
        } else {
            loadItems();

            HistoryController.createHistory({
                action: `Alteração do Item: "${itemQuebrado.name}"`,
                userName: users[0] ? users[0].name : null,
                userRole: "Funcionário",
                location: `Id do Armazém: ${itemQuebrado.warehouseId}`,
                description: `Alteração do Item "${itemQuebrado.name}" com status de ${itemQuebrado.status}`,
            });
        }
        //  diminuir quantidade do item anterior
        const itemSendoRegistrado = allItems.filter(item => Number(item.id) === Number(editItem.id));
        itemSendoRegistrado.quantity -= itemQuebrado.quantity;
        await ItemController.updateItem(editItem);
        
        const updatedItems = items.map(item =>
            item.id === editItem.id ? editItem : item
        );
        setItems(updatedItems);
        await AsyncStorage.setItem('items', JSON.stringify(updatedItems));
        setSelectDestinyModalOpen(false);
        handleCloseModal();
        alert("Avaria registrada com sucesso");
    };

    const handleRegisterBreak = async () => {
        if (editItem.quantity <= 0 || !editItem.name || !editItem.warehouseId || !editItem.category || !editItem.volume || !editItem.expirationDate) {
            alert("Erro: Todos os campos devem ser preenchidos corretamente.");
            return;
        }

        const updatedItems = items.map(item =>
            item.id === editItem.id ? editItem : item
        );
        setItems(updatedItems);
        await AsyncStorage.setItem('items', JSON.stringify(updatedItems));
        setEditModalOpen(false);
        handleCloseModal();
        alert("Alteração realizada com sucesso!");
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

    // Carregar usuários ao iniciar.
    useEffect(() => {
        const fetchUsers = async () => {
            const response = await UserController.listUsers();
            setUsers(response);
        };

        fetchUsers();
    }, []);

    return (
        <main className={styles.wContainer}>
            
            <section className={styles.content}>
                {showWarehousesOrigin && (
                    <section className={`${showWarehousesOrigin ? styles.formContainer : styles.fullFormContainer}`}>
                        <h1>Armazém do item</h1>
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
                        <h1>Selecione o item</h1>
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

            {selectDestinyModalOpen && (
                <section className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h2>Registrar avaria em itens</h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleUpdateItem();
                            }}
                        >
                            <label>Quantidade:</label>
                            <input 
                                type="number"
                                value={editItem.quantity}
                                onChange={(e) => setEditItem({...editItem, quantity: e.target.value})}
                            />
                            <label htmlFor="description">Detalhe:</label>
                            <input 
                                type="text"
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.de)}
                                required
                            />                           
                                             
                            <div className={styles.modalActions}>
                                <button type="submit">Salvar</button>
                                <button onClick={() => setSelectDestinyModalOpen(false)}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </section>
            )}

        </main>
    );
};