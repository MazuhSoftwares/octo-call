import {
  writeToPersistence,
  readFromPersistence,
  appendToPersistence,
} from "./persistence";

describe("persistence", () => {
  const localStorageMock = (function () {
    return {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn(),
    };
  })();

  const sessionStorageMock = (function () {
    return {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn(),
    };
  })();

  beforeAll(() => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    Object.defineProperty(window, "sessionStorage", {
      value: sessionStorageMock,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("reads data from localStorage", () => {
    (localStorage.getItem as jest.Mock).mockReturnValueOnce(
      '{"id":666,"name":"John Constantine","isHuman":true}'
    );
    const result = readFromPersistence<object>(localStorage, "occultist");
    expect(localStorage.getItem).toHaveBeenCalledWith("occultist");
    expect(result).toEqual({
      id: 666,
      name: "John Constantine",
      isHuman: true,
    });
  });

  it("writes data to localStorage", () => {
    const testObject = { id: 666, name: "John Constantine", isHuman: true };
    const result = writeToPersistence(localStorage, "occultist", testObject);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "occultist",
      JSON.stringify(testObject)
    );
    expect(result).toBe(true);
  });

  it("reads data from sessionStorage", () => {
    (sessionStorage.getItem as jest.Mock).mockReturnValueOnce(
      '{"id":666,"name":"John Constantine","isHuman":true}'
    );
    const result = readFromPersistence<object>(sessionStorage, "occultist");
    expect(sessionStorage.getItem).toHaveBeenCalledWith("occultist");
    expect(result).toEqual({
      id: 666,
      name: "John Constantine",
      isHuman: true,
    });
  });

  it("writes data to sessionStorage", () => {
    const testObject = { id: 666, name: "John Constantine", isHuman: true };
    const result = writeToPersistence(sessionStorage, "occultist", testObject);
    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      "occultist",
      JSON.stringify(testObject)
    );
    expect(result).toBe(true);
  });

  it("may fail to write data to storage, implies in false result", () => {
    const testObject = { id: 666, name: "John Constantine", isHuman: true };
    (localStorage.setItem as jest.Mock).mockImplementationOnce(() => {
      throw new Error();
    });
    const result = writeToPersistence(localStorage, "occultist", testObject);
    expect(result).toBe(false);
  });

  it("may fail to read from storage, implies in null result", () => {
    (localStorage.getItem as jest.Mock).mockReturnValueOnce(
      "invalid stuff, non-json"
    );
    const result = readFromPersistence<object>(localStorage, "occultist");
    expect(localStorage.getItem).toHaveBeenCalledWith("occultist");
    expect(result).toEqual(null);
  });

  it("may not have content to read from storage, implies in null result", () => {
    (localStorage.getItem as jest.Mock).mockReturnValueOnce(null);
    const result = readFromPersistence<object>(localStorage, "occultist");
    expect(localStorage.getItem).toHaveBeenCalledWith("occultist");
    expect(result).toEqual(null);
  });

  it("can append new data to existing data in storage", () => {
    (localStorage.getItem as jest.Mock).mockReturnValueOnce(
      '{"id":666,"name":"John Constantine","isHuman":true}'
    );

    const result = appendToPersistence(localStorage, "occultist", {
      name: "John C.",
      isRealPerson: false,
    });
    expect(result).toBe(true);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      "occultist",
      '{"id":666,"name":"John C.","isHuman":true,"isRealPerson":false}'
    );
  });

  it("will just write as it is if theres no existing data while appending", () => {
    (localStorage.getItem as jest.Mock).mockReturnValueOnce(null);

    const result = appendToPersistence(localStorage, "occultist", {
      name: "John C.",
      isRealPerson: false,
    });
    expect(result).toBe(true);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      "occultist",
      JSON.stringify({
        name: "John C.",
        isRealPerson: false,
      })
    );
  });
});
