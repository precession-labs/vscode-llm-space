import type { FileStat } from "./files";

export interface TreeNode {
  id: string;
  file: FileStat;
  children: string[];
  selected: boolean;
  expanded: boolean;
}

export class TreeModel {
  constructor(
    private get: () => Record<string, TreeNode>,
    private set: (nodes: Record<string, TreeNode>) => void
  ) {}

  updateRoot(file: FileStat) {
    const nodes = this.buildNodes(file);
    const root = nodes[file.resource.toString()]!;
    root.expanded = true;
    this.set({ ...nodes });
  }

  buildNodes(file: FileStat) {
    const nodes: Record<string, TreeNode> = {};
    const queue: FileStat[] = [file];
    while (queue.length > 0) {
      const file = queue.shift();
      if (!file) {
        break;
      }
      const node = this.toNode(file);
      nodes[node.id] = node;
      const parent = nodes[file.resource.parent.toString()];
      if (parent) {
        parent.children.push(node.id);
      }
      if (file.isDirectory && file.children) {
        queue.push(
          ...file.children.sort((a, b) => {
            if (a.isDirectory && !b.isDirectory) {
              return -1;
            }
            if (!a.isDirectory && b.isDirectory) {
              return 1;
            }
            return a.name.localeCompare(b.name);
          })
        );
      }
    }
    return nodes;
  }

  getNodeById(id: string) {
    const node = this.get()[id];
    if (!node) {
      throw new Error(`Node with id ${id} not found`);
    }
    return node;
  }

  hasNode(id: string) {
    return this.get()[id] !== undefined;
  }

  addChild(parent: TreeNode, file: FileStat): TreeNode {
    const nodes = { ...this.get(), ...this.buildNodes(file) };
    this.set({
      ...nodes,
      [parent.id]: {
        ...parent,
        children: this.sortChildren(nodes, [
          ...parent.children,
          file.resource.toString()
        ])
      }
    });
    return nodes[file.resource.toString()]!;
  }

  removeNode(node: TreeNode) {
    console.log("removeNode", node);
    const nodes = this.get();
    const removed = this.removeChild(nodes, node);
    const parent = nodes[node.file.resource.parent.toString()];
    if (parent) {
      parent.children = parent.children.filter(child => child !== node.id);
    }
    this.set({ ...nodes });
    return removed;
  }

  updateNode(
    node: TreeNode,
    file: FileStat
  ): { node: TreeNode; replaced: Record<string, string>; removed: string[]; } {
    const nodes = this.buildNodes(file);
    const replaced: Record<string, string> = {};
    const removed: string[] = [];
    // cache the new created nodes with `${depth}-${name}`
    const cache: Record<string, TreeNode> = {};
    const newNode = nodes[file.resource.toString()]!;
    this.traverse(nodes, newNode, (item, depth) => {
      const key = `${depth}-${item.file.name}`;
      cache[key] = item;
    });
    // check old nodes
    this.traverse(this.get(), node, (item, depth) => {
      const key = `${depth}-${item.file.name}`;
      if (cache[key]) {
        replaced[item.id] = cache[key].id;
      } else {
        removed.push(item.id);
      }
    });
    const prevNodes = this.get();
    delete prevNodes[node.id];
    const newNodes = { ...prevNodes, ...nodes };
    // update the nodes
    removed.forEach(id => {
      delete newNodes[id];
    });
    const parent = newNodes[newNode.file.resource.parent.toString()];
    if (parent) {
      const children = this.sortChildren(newNodes, [
        ...parent.children,
        newNode.id
      ]);
      newNodes[parent.id] = {
        ...parent,
        children
      };
    }
    this.set(newNodes);
    return { node: newNode, replaced, removed };
  }

  resolveFileChildren(node: TreeNode) {
    console.log("resolveFileChildren", node);
    const nodes = this.get();
    const children: TreeNode[] = [];
    const queue: TreeNode[] = [node];
    while (queue.length > 0) {
      const items = [...queue];
      queue.length = 0;
      items.forEach(node => {
        if (node.file.isFile) {
          children.push(node);
        }
        node.children.forEach(id => {
          const child = nodes[id];
          if (child) {
            queue.push(child);
          }
        });
      });
    }
    return children;
  }

  isDescendant(target: TreeNode, node: TreeNode) {
    if (target.file.isDirectory) {
      return node.file.resource
        .toString()
        .startsWith(target.file.resource.toString());
    } else {
      return node.file.resource.parent.isEqual(target.file.resource);
    }
  }

  expandNode(node: TreeNode, expanded: boolean) {
    const nodes = this.get();
    const target = nodes[node.id];
    if (target) {
      nodes[target.id] = {
        ...target,
        expanded
      };
    }
    this.set({ ...nodes });
  }

  selectNode(node: TreeNode, selected: boolean) {
    const nodes = this.get();
    const target = nodes[node.id];
    if (target) {
      nodes[target.id] = {
        ...target,
        [target.id]: { ...target, selected }
      };
    }
    this.set({ ...nodes });
  }

  traverse(
    nodes: Record<string, TreeNode>,
    node: TreeNode,
    callback: (node: TreeNode, depth: number) => void
  ) {
    const queue: [TreeNode, number][] = [[node, 0]];
    while (queue.length > 0) {
      const [node, depth] = queue.shift()!;
      callback(node, depth);
      node.children.forEach(id => {
        const child = nodes[id];
        if (child) {
          queue.push([child, depth + 1]);
        }
      });
    }
  }

  private removeChild(
    nodes: Record<string, TreeNode>,
    node: TreeNode
  ): string[] {
    const removed: string[] = [node.id];
    delete nodes[node.id];
    node.children.forEach(id => {
      const child = nodes[id];
      if (child) {
        removed.push(...this.removeChild(nodes, child));
      }
    });
    return removed;
  }

  private toNode(file: FileStat): TreeNode {
    const node: TreeNode = {
      id: file.resource.toString(),
      file,
      children: [],
      selected: false,
      expanded: false
    };
    return node;
  }

  private sortChildren(nodes: Record<string, TreeNode>, children: string[]) {
    return Array.from(new Set(children)).sort((a, b) => {
      const aNode = nodes[a];
      const bNode = nodes[b];
      if (aNode?.file.isDirectory && !bNode?.file.isDirectory) {
        return -1;
      }
      if (!aNode?.file.isDirectory && bNode?.file.isDirectory) {
        return 1;
      }
      return (aNode?.file.name ?? "") > (bNode?.file.name ?? "") ? 1 : -1;
    });
  }
}
