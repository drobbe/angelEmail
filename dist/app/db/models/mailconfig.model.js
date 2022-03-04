"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServersActive = exports.getServer = void 0;
const connection_1 = require("../connection");
const getServer = (server) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield connection_1.default.servers.findUnique({
            where: {
                id: Number(server)
            }
        });
        return data;
    }
    catch (error) {
        console.log(error);
    }
});
exports.getServer = getServer;
const getServersActive = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield connection_1.default.servers.findMany({
            where: {
                active: 1
            }
        });
        return data;
    }
    catch (error) {
        console.log(error);
    }
});
exports.getServersActive = getServersActive;
//# sourceMappingURL=mailconfig.model.js.map