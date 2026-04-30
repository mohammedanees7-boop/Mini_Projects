// employeeService.js — Async delegates to storageService. No filtering logic (server-side now).

const employeeService = (() => {
  return {
    async getAll(params = {})   { return storageService.getAll(params); },
    async getById(id)           { return storageService.getById(id); },
    async add(data)             { return storageService.add(data); },
    async update(id, data)      { return storageService.update(id, data); },
    async remove(id)            { return storageService.remove(id); }
  };
})();
