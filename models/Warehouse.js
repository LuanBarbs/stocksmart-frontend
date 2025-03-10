import { insertWarehouse } from "../api/warehouseApi";

// Classe para o Armazém.
export default class Warehouse {
    constructor(id, name, location, capacity, zones = []) {
        this.id = id;
        this.name = name;                                   // Nome do depósito.
        this.location = location;                           // Endereço.
        this.capacity = capacity;                           // Capacidade total do depósito.
        this.currentCapacity = capacity;                    // Capacidade atual disponível.
        this.zones = Array.isArray(zones) ? zones : [];     // Lista de zonas dentro do depósito (frio, seco).
        this.status = "active";                             // Ativo / Inativo.
        this.createdAt = new Date();                        // Data de criação do depósito.
        this.items = [];                                    // Lista de itens no depósito.
    };

    // Adiciona um item ao depósito.
    addItem(item) {
        if (item && item.volume && this.getAvailableCapacity() >= item.volume) {
            this.items.push(item);
            this.currentCapacity -= item.volume;
            return true;
        }
        return false;
    };

    // Remove um item do depósito.
    removeItem(itemId) {
        const index = this.items.findIndex(item => item.id === itemId);
        if (index > -1) {
            this.currentCapacity += this.items[index].volume;
            this.items.splice(index, 1);
            return true;
        }
        return false;
    };

    // Retorna a capacidade disponível do depósito.
    getAvailableCapacity() {
        return this.currentCapacity;
    };

    // Ativa ou desativa o depósito.
    toggleStatus() {
        this.status = this.status === "active" ? "inactive" : "active";
    };
};